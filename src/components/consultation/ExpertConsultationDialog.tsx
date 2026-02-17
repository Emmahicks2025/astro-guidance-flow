import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, Phone, Send, Loader2, PhoneOff, Mic, MicOff, 
  Star, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useConversation } from "@elevenlabs/react";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  rate: number;
  status: 'online' | 'busy' | 'offline';
  avatar: string;
  category: string;
  languages: string[];
  sessions: number;
  ai_personality?: string;
  voice_id?: string;
  user_id?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExpertConsultationDialogProps {
  expert: Expert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'chat' | 'call';
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/expert-chat`;
const CONTEXT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-call-context`;
const TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-conversation-token`;
const SAVE_MEMORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-conversation-memory`;

export function ExpertConsultationDialog({ 
  expert, 
  open, 
  onOpenChange,
  initialTab = 'chat' 
}: ExpertConsultationDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevOpenRef = useRef(false);
  const callTranscriptRef = useRef<string[]>([]);
  const expertIdRef = useRef<string>("");

  // Treat as AI if has ai_personality OR has no real user_id
  const isAI = !!expert?.ai_personality || !expert?.user_id;

  // ElevenLabs Conversational AI — single WebRTC connection handles STT+LLM+TTS
  const conversation = useConversation({
    onConnect: () => {
      console.log("ElevenLabs conversation connected");
      setIsCallActive(true);
      setIsConnecting(false);
      toast.success(`Connected with ${expert?.name}`);
    },
    onDisconnect: () => {
      console.log("ElevenLabs conversation disconnected");
      handleCallEnd();
    },
    onMessage: (message: any) => {
      // Collect transcript for memory extraction
      if (message.type === "user_transcript") {
        const text = message.user_transcription_event?.user_transcript;
        if (text) callTranscriptRef.current.push(`User: ${text}`);
      } else if (message.type === "agent_response") {
        const text = message.agent_response_event?.agent_response;
        if (text) callTranscriptRef.current.push(`Expert: ${text}`);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast.error("Voice connection error. Please try again.");
      setIsConnecting(false);
    },
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open && !prevOpenRef.current && expert) {
      setActiveTab(initialTab);
      setMessages([]);
      setInputMessage("");
      setIsCallActive(false);
      setCallDuration(0);
      setConsultationId(null);
      callTranscriptRef.current = [];
      expertIdRef.current = expert.id;
      
      if (!isAI && user) {
        createConsultation();
      }
    }
    prevOpenRef.current = open;
    
    return () => {
      if (!open && consultationId) {
        supabase.removeChannel(supabase.channel(`messages-${consultationId}`));
      }
    };
  }, [open, expert?.id]);

  // Realtime messages for human experts
  useEffect(() => {
    if (!consultationId || isAI) return;
    const channel = supabase
      .channel(`messages-${consultationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `consultation_id=eq.${consultationId}`,
      }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id !== user?.id) {
          setMessages(prev => [...prev, { role: 'assistant', content: msg.content }]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [consultationId, isAI, user?.id]);

  const createConsultation = async () => {
    if (!expert || !user) return;
    try {
      const { data: profileData } = await supabase
        .from('jotshi_profiles').select('user_id').eq('id', expert.id).maybeSingle();
      if (!profileData?.user_id) { toast.error("Unable to connect with this expert"); return; }
      const { data, error } = await supabase
        .from('consultations')
        .insert({ user_id: user.id, jotshi_id: profileData.user_id, status: 'waiting', concern: 'Chat consultation' })
        .select('id').single();
      if (error) throw error;
      setConsultationId(data.id);
    } catch (err) {
      console.error('Error creating consultation:', err);
      toast.error("Failed to start consultation");
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save conversation memory after call ends
  const saveMemory = useCallback(async () => {
    const transcript = callTranscriptRef.current.join("\n");
    if (!transcript || !expertIdRef.current || !user) return;
    
    try {
      await fetch(SAVE_MEMORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ expertId: expertIdRef.current, transcript }),
      });
      console.log("Conversation memory saved");
    } catch (err) {
      console.error("Failed to save memory:", err);
    }
  }, [user]);

  const handleCallEnd = useCallback(() => {
    setIsCallActive(false);
    setIsConnecting(false);
    // Save memory in background
    saveMemory();
  }, [saveMemory]);

  // Start voice call using ElevenLabs Conversational AI
  const startCall = async () => {
    if (!expert || !expert.voice_id) {
      toast.error("Voice not configured for this expert. Please use chat instead.");
      return;
    }

    setIsConnecting(true);
    callTranscriptRef.current = [];

    try {
      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop()));

      // Fetch call context (profile + memories + expert personality) and token in parallel
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const [contextResp, tokenResp] = await Promise.all([
        fetch(CONTEXT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ expertId: expert.id }),
        }),
        fetch(TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        }),
      ]);

      if (!tokenResp.ok) throw new Error("Failed to get conversation token");
      const { token } = await tokenResp.json();
      if (!token) throw new Error("No token received");

      let overrides: any = {};
      if (contextResp.ok) {
        const context = await contextResp.json();
        overrides = {
          agent: {
            prompt: { prompt: context.systemPrompt },
            firstMessage: context.firstMessage,
            language: "en",
          },
          tts: {
            voiceId: expert.voice_id,
          },
        };
      }

      // Start the conversation — single WebRTC connection handles everything
      await conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
        overrides,
      });
    } catch (err: any) {
      console.error("Start call error:", err);
      setIsConnecting(false);
      if (err?.name === 'NotAllowedError') {
        toast.error("Microphone permission denied.", { duration: 6000 });
      } else {
        toast.error(err?.message || "Failed to start voice call. Try again.", { duration: 5000 });
      }
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
    } catch {
      // Force cleanup
      handleCallEnd();
    }
    toast.info(`Call ended — Duration: ${formatDuration(callDuration)}`);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    // ElevenLabs handles mute via volume or we just track state
    if (newMuted) {
      conversation.setVolume({ volume: 0 });
    } else {
      conversation.setVolume({ volume: 1 });
    }
  };

  // Send message — AI or human (chat tab)
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || !expert) return;

    const userMessage: Message = { role: 'user', content: inputMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    if (isAI) {
      let assistantContent = "";
      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            messages: [...messages, userMessage],
            expertId: expert.id,
            expertName: expert.name,
            expertPersonality: expert.ai_personality
          }),
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) toast.error("Rate limit exceeded. Please wait.");
          if (resp.status === 402) toast.error("Service temporarily unavailable.");
          throw new Error("Failed to get response");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        const updateAssistant = (content: string) => {
          assistantContent = content;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
            }
            return [...prev, { role: "assistant", content: assistantContent }];
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                updateAssistant(assistantContent);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        toast.error("Failed to send message.");
        setMessages(prev => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!consultationId || !user) {
        setIsLoading(false);
        toast.error("Consultation not ready. Please try again.");
        return;
      }
      try {
        const { error } = await supabase
          .from('messages')
          .insert({ consultation_id: consultationId, sender_id: user.id, content: userMessage.content, message_type: 'text' });
        if (error) throw error;
        await supabase.from('consultations')
          .update({ status: 'active', started_at: new Date().toISOString() })
          .eq('id', consultationId).eq('status', 'waiting');
      } catch (error) {
        console.error("Message send error:", error);
        toast.error("Failed to send message.");
        setMessages(prev => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    }
  }, [inputMessage, messages, expert, isLoading, isAI, consultationId, user]);

  if (!expert) return null;

  const isAgentSpeaking = conversation.isSpeaking;
  const isConnected = conversation.status === "connected";

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && isCallActive) endCall();
      if (!open && consultationId) {
        supabase.from('consultations').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', consultationId);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-lg h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                expert.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground/40'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{expert.name}</h3>
              <p className="text-sm text-secondary truncate">{expert.specialty}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-gold fill-gold" />{expert.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{expert.experience}
                </span>
                <span className="text-primary font-medium">₹{expert.rate}/min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'call')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2 mx-4 mt-3">
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="w-4 h-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="call" className="gap-2" disabled={!isAI || !expert.voice_id}>
              <Phone className="w-4 h-4" /> Voice Call
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 p-0">
            <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
              <div className="py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Start your consultation with {expert.name}
                    </p>
                    {!isAI && !consultationId && (
                      <p className="text-xs text-muted-foreground mt-2">Connecting...</p>
                    )}
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isAI ? 'Thinking...' : 'Waiting for reply...'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <SpiritualInput
                  placeholder={`Message ${expert.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1"
                  disabled={!isAI && !consultationId}
                />
                <SpiritualButton
                  type="submit"
                  variant="primary"
                  size="icon"
                  disabled={!inputMessage.trim() || isLoading || (!isAI && !consultationId)}
                >
                  <Send className="w-4 h-4" />
                </SpiritualButton>
              </form>
            </div>
          </TabsContent>

          {/* Call Tab */}
          <TabsContent value="call" className="flex-1 flex flex-col items-center justify-center m-0 p-4">
            <div className="text-center space-y-6 w-full max-w-xs">
              <div className="relative mx-auto w-28 h-28">
                <div className={`w-28 h-28 rounded-full overflow-hidden ring-4 ${
                  isCallActive ? (isAgentSpeaking ? 'ring-primary animate-pulse' : 'ring-green-500') : 'ring-border'
                }`}>
                  <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                </div>
                {isCallActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg">{expert.name}</h3>
                <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                {isCallActive && (
                  <p className="text-primary font-mono mt-2">{formatDuration(callDuration)}</p>
                )}
              </div>

              {isConnecting && (
                <div className="text-sm text-muted-foreground animate-pulse flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                </div>
              )}

              {isCallActive && (
                <div className="text-sm text-muted-foreground">
                  {isAgentSpeaking && <p className="text-primary animate-pulse">🔊 Speaking...</p>}
                  {!isAgentSpeaking && <p className="text-green-500 animate-pulse">🎙 Listening...</p>}
                </div>
              )}

              <div className="flex justify-center gap-4">
                {!isCallActive && !isConnecting ? (
                  <SpiritualButton variant="primary" size="lg" className="w-full gap-2" onClick={startCall}>
                    <Phone className="w-5 h-5" /> Start Voice Call
                  </SpiritualButton>
                ) : isCallActive ? (
                  <>
                    <SpiritualButton
                      variant={isMuted ? "primary" : "outline"}
                      size="icon"
                      className="w-14 h-14 rounded-full"
                      onClick={toggleMute}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </SpiritualButton>
                    <SpiritualButton
                      variant="primary"
                      size="icon"
                      className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90"
                      onClick={endCall}
                    >
                      <PhoneOff className="w-6 h-6" />
                    </SpiritualButton>
                  </>
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
