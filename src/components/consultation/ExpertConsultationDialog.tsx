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
import { useCredits } from "@/hooks/useCredits";
import { CreditPaywall } from "@/components/billing/CreditPaywall";
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
  const { balance, deductCredits } = useCredits();
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState<"chat" | "call">("chat");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevOpenRef = useRef(false);
  const callTranscriptRef = useRef<string[]>([]);
  const expertIdRef = useRef<string>("");
  const ringtoneRef = useRef<{ ctx: AudioContext; interval: NodeJS.Timeout } | null>(null);

  // Ringtone using Web Audio API — plays a classic "ring-ring" tone
  const startRingtone = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const playRing = () => {
        // Two-tone burst (440Hz + 480Hz) like a real phone ring
        [440, 480].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.type = "sine";
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.8);
        });
      };
      playRing();
      const interval = setInterval(playRing, 2500); // Ring every 2.5s
      ringtoneRef.current = { ctx, interval };
    } catch { /* audio not supported */ }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current.interval);
      ringtoneRef.current.ctx.close().catch(() => {});
      ringtoneRef.current = null;
    }
  }, []);

  // Treat as AI if has ai_personality OR has no real user_id
  const isAI = !!expert?.ai_personality || !expert?.user_id;

  // ElevenLabs Conversational AI — single WebRTC connection handles STT+LLM+TTS
  const conversation = useConversation({
    onConnect: () => {
      console.log("ElevenLabs conversation connected!");
      // Clear connection timeout
      if ((window as any).__callConnectTimeout) {
        clearTimeout((window as any).__callConnectTimeout);
        delete (window as any).__callConnectTimeout;
      }
      stopRingtone();
      setIsCallActive(true);
      setIsConnecting(false);
      toast.success(`Connected with ${expert?.name}`);
    },
    onDisconnect: (reason: any) => {
      console.log("ElevenLabs conversation disconnected, reason:", JSON.stringify(reason));
      stopRingtone();
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
    onError: (error: any) => {
      console.error("Conversation error:", error, "type:", typeof error, "keys:", error ? Object.keys(error) : "null");
      toast.error("Voice connection error. Please try again.");
      stopRingtone();
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
    if (!expert) {
      toast.error("No expert selected.");
      return;
    }
    // Credit check: need at least 1 minute worth of call credits
    if (balance < 8) {
      setPaywallContext("call");
      setShowPaywall(true);
      return;
    }

    setIsConnecting(true);
    startRingtone();
    callTranscriptRef.current = [];

    try {
      // Request mic permission (non-blocking — WebRTC can still connect without mic)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        console.log("Mic permission granted");
      } catch (micErr: any) {
        if (micErr?.name === 'NotAllowedError') {
          throw micErr;
        }
        console.warn("Mic not available, proceeding anyway:", micErr?.message);
      }

      // Fetch call context and token in parallel
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error("Please log in to make a call");

      console.log("Fetching context and token...");
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
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        }),
      ]);

      if (!tokenResp.ok) {
        const errBody = await tokenResp.text();
        console.error("Token fetch failed:", tokenResp.status, errBody);
        throw new Error("Failed to get conversation token");
      }
      const tokenData = await tokenResp.json();
      console.log("Token received:", !!tokenData.token, "AgentId:", tokenData.agentId);
      if (!tokenData.token) throw new Error("No token received");

      let overrides: any = {};
      if (contextResp.ok) {
        const context = await contextResp.json();
        console.log("Context received, expert:", context.expertName, "voiceId:", context.expertVoiceId);
        overrides = {
          agent: {
            prompt: { prompt: context.systemPrompt },
            firstMessage: context.firstMessage,
            language: context.languageCode || "hi",
          },
        };
        // Only override voice if a valid voice_id exists
        const voiceId = context.expertVoiceId || expert.voice_id;
        if (voiceId) {
          overrides.tts = { voiceId };
        }
      } else {
        console.warn("Context fetch failed:", contextResp.status);
      }

      // Set a timeout — if onConnect doesn't fire in 20s, stop trying
      const connectTimeout = setTimeout(() => {
        console.error("Connection timeout — onConnect never fired");
        stopRingtone();
        setIsConnecting(false);
        toast.error("Connection timed out. Please try again.", { duration: 5000 });
        try { conversation.endSession(); } catch {}
      }, 20000);

      // Store timeout so onConnect can clear it
      (window as any).__callConnectTimeout = connectTimeout;

      console.log("Starting ElevenLabs session with overrides:", JSON.stringify(overrides));
      await conversation.startSession({
        conversationToken: tokenData.token,
        connectionType: "webrtc",
        overrides,
      });
      console.log("startSession() resolved");
    } catch (err: any) {
      console.error("Start call error:", err);
      stopRingtone();
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

    // Credit check for chat
    if (balance < 1) {
      setPaywallContext("chat");
      setShowPaywall(true);
      return;
    }
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
    <>
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
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-muted-foreground/50"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
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

          {/* Call Tab — Phone-style full layout */}
          <TabsContent value="call" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-between bg-gradient-to-b from-background to-muted/20 px-6 py-6">
              {/* Avatar & Info */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="relative">
                  {(isConnecting || isCallActive) && (
                    <>
                      <motion.div
                        className="absolute inset-[-10px] rounded-full border-2 border-primary/30"
                        animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-[-10px] rounded-full border-2 border-primary/20"
                        animate={{ scale: [1, 1.55], opacity: [0.3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                      />
                    </>
                  )}
                  <div className={`w-20 h-20 rounded-full overflow-hidden ring-4 transition-all duration-300 ${
                    isCallActive
                      ? isAgentSpeaking ? 'ring-primary shadow-lg shadow-primary/25' : 'ring-green-500 shadow-lg shadow-green-500/25'
                      : isConnecting ? 'ring-primary/50 animate-pulse' : 'ring-border'
                  }`}>
                    <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <h3 className="font-semibold text-foreground">{expert.name}</h3>
                <p className="text-xs text-muted-foreground">{expert.specialty}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col items-center gap-1">
                {isConnecting && (
                  <motion.p
                    className="text-base font-medium text-muted-foreground"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Calling...
                  </motion.p>
                )}
                {isCallActive && (
                  <>
                    <p className="text-primary font-mono text-2xl tracking-wider font-semibold">{formatDuration(callDuration)}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAgentSpeaking ? '🔊 Speaking...' : '🎙️ Listening...'}
                    </p>
                  </>
                )}
                {!isConnecting && !isCallActive && (
                  <p className="text-sm text-muted-foreground">Ready to connect</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pb-2">
                {!isCallActive && !isConnecting ? (
                  <button
                    onClick={startCall}
                    className="flex items-center gap-3 px-8 py-4 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/30 text-white font-semibold text-base"
                  >
                    <Phone className="w-5 h-5" />
                    Start Voice Call
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-10">
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={toggleMute}
                        className={`flex items-center justify-center w-14 h-14 rounded-full transition-all active:scale-95 ${
                          isMuted
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      <span className="text-[11px] text-muted-foreground">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={endCall}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 active:scale-95 transition-all shadow-lg shadow-destructive/30"
                      >
                        <PhoneOff className="w-7 h-7 text-white" />
                      </button>
                      <span className="text-[11px] text-muted-foreground">End</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${
                        isAgentSpeaking ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {isAgentSpeaking ? (
                          <div className="flex items-center gap-[3px]">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                className="w-1 bg-primary rounded-full"
                                animate={{ height: [8, 20, 8] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                        ) : (
                          <Phone className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {isAgentSpeaking ? 'Speaking' : 'Audio'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    <CreditPaywall
      open={showPaywall}
      onOpenChange={setShowPaywall}
      currentBalance={balance}
      creditsNeeded={paywallContext === "call" ? 8 : 1}
      context={paywallContext}
    />
    </>
  );
}
