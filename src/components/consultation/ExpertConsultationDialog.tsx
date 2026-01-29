import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, Phone, Send, Loader2, PhoneOff, Mic, MicOff, 
  Volume2, VolumeX, Star, Clock, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

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
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

export function ExpertConsultationDialog({ 
  expert, 
  open, 
  onOpenChange,
  initialTab = 'chat' 
}: ExpertConsultationDialogProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>(initialTab);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callMessages, setCallMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (open && expert) {
      setMessages([]);
      setCallMessages([]);
      setInputMessage("");
      setIsCallActive(false);
      setCallDuration(0);
      setCurrentTranscript("");
    }
  }, [open, expert?.id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get AI response and speak it
  const getAIResponseAndSpeak = useCallback(async (userText: string) => {
    if (!expert || !expert.voice_id) return;

    const userMessage: Message = { role: 'user', content: userText };
    setCallMessages(prev => [...prev, userMessage]);

    try {
      // Get AI text response
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...callMessages, userMessage],
          expertId: expert.id,
          expertName: expert.name,
          expertPersonality: expert.ai_personality
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to get response");
      }

      // Collect full response from stream
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let textBuffer = "";

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
              fullResponse += content;
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Add assistant message
      const assistantMessage: Message = { role: 'assistant', content: fullResponse };
      setCallMessages(prev => [...prev, assistantMessage]);

      // Convert to speech using ElevenLabs
      setIsSpeaking(true);
      
      const ttsResponse = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: fullResponse,
          voiceId: expert.voice_id
        }),
      });

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Resume listening after speaking
          if (isCallActive && !isMuted && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (e) {
              console.log("Recognition already started");
            }
          }
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        setIsSpeaking(false);
        console.error("TTS error:", await ttsResponse.text());
      }
    } catch (error) {
      console.error("Call AI error:", error);
      setIsSpeaking(false);
      toast.error("Failed to get response");
    }
  }, [expert, callMessages, isCallActive, isMuted]);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentTranscript(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false);
        if (transcript.trim()) {
          getAIResponseAndSpeak(transcript.trim());
        }
        setCurrentTranscript("");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error("Speech recognition error. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [getAIResponseAndSpeak]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || !expert) return;

    const userMessage: Message = { role: 'user', content: inputMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

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
        if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
          throw new Error("Rate limit exceeded");
        }
        if (resp.status === 402) {
          toast.error("Service temporarily unavailable.");
          throw new Error("Payment required");
        }
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
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, messages, expert, isLoading]);

  const startCall = async () => {
    if (!expert) return;
    
    if (!expert.voice_id) {
      toast.error("Voice not configured for this expert. Please use chat instead.");
      return;
    }
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognition = initSpeechRecognition();
      if (!recognition) return;
      
      recognitionRef.current = recognition;
      setIsCallActive(true);
      setCallMessages([]);
      toast.success(`Connected with ${expert.name}`);
      
      // Start listening
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          console.error("Failed to start recognition:", e);
        }
      }, 500);
      
    } catch (error) {
      console.error("Microphone access error:", error);
      toast.error("Please enable microphone access to use voice calls.");
    }
  };

  const endCall = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition already stopped");
      }
      recognitionRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentTranscript("");
    toast.info(`Call ended - Duration: ${formatDuration(callDuration)}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      // Muting - stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    } else {
      // Unmuting - start listening if not speaking
      if (!isSpeaking && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.log("Recognition error:", e);
        }
      }
    }
  };

  if (!expert) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && isCallActive) {
        endCall();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-lg h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                <img 
                  src={expert.avatar} 
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
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
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  {expert.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {expert.experience}
                </span>
                <span className="text-primary font-medium">₹{expert.rate}/min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'call')} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="call" className="gap-2" disabled={!expert.voice_id}>
              <Phone className="w-4 h-4" />
              Call
              {!expert.voice_id && <span className="text-[10px] text-muted-foreground ml-1">(N/A)</span>}
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
              <div className="py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">
                      Start a conversation with {expert.name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Ask about your concerns and get spiritual guidance
                    </p>
                  </div>
                )}
                
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Typing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t border-border bg-background">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <SpiritualInput
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <SpiritualButton 
                  type="submit" 
                  variant="primary"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </SpiritualButton>
              </form>
            </div>
          </TabsContent>

          {/* Call Tab */}
          <TabsContent value="call" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {!isCallActive ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/20 mx-auto mb-6">
                    <img 
                      src={expert.avatar} 
                      alt={expert.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{expert.name}</h3>
                  <p className="text-muted-foreground mb-1">{expert.specialty}</p>
                  <p className="text-sm text-primary mb-8">₹{expert.rate}/min</p>
                  
                  <SpiritualButton 
                    variant="primary" 
                    size="lg"
                    onClick={startCall}
                    className="gap-3 px-8"
                    disabled={expert.status !== 'online' || !expert.voice_id}
                  >
                    <Phone className="w-5 h-5" />
                    Start Call
                  </SpiritualButton>
                  
                  {expert.status !== 'online' && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Expert is currently offline
                    </p>
                  )}
                  
                  {!expert.voice_id && (
                    <p className="text-sm text-amber-500 mt-4">
                      Voice not configured for this expert
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center w-full"
                >
                  <div className="relative mb-6">
                    <div className={`w-32 h-32 rounded-full overflow-hidden ring-4 mx-auto ${
                      isSpeaking ? 'ring-secondary' : isListening ? 'ring-green-500' : 'ring-primary/50'
                    }`}>
                      <img 
                        src={expert.avatar} 
                        alt={expert.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {(isListening || isSpeaking) && (
                      <motion.div 
                        className={`absolute inset-0 rounded-full border-4 ${
                          isSpeaking ? 'border-secondary/50' : 'border-green-500/50'
                        }`}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-1">{expert.name}</h3>
                  <p className={`font-medium mb-2 ${
                    isSpeaking ? 'text-secondary' : isListening ? 'text-green-500' : 'text-primary'
                  }`}>
                    {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Connected'}
                  </p>
                  <p className="text-2xl font-mono text-foreground mb-4">
                    {formatDuration(callDuration)}
                  </p>
                  
                  {/* Current transcript */}
                  {currentTranscript && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4 mx-4 text-sm text-muted-foreground italic">
                      "{currentTranscript}"
                    </div>
                  )}
                  
                  {/* Recent messages */}
                  {callMessages.length > 0 && (
                    <div className="max-h-32 overflow-y-auto mb-4 mx-4 space-y-2">
                      {callMessages.slice(-2).map((msg, idx) => (
                        <div 
                          key={idx}
                          className={`text-xs p-2 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-primary/10 text-right' 
                              : 'bg-secondary/10 text-left'
                          }`}
                        >
                          <span className="font-medium">
                            {msg.role === 'user' ? 'You' : expert.name}:
                          </span>{' '}
                          {msg.content.substring(0, 100)}
                          {msg.content.length > 100 && '...'}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-4">
                    <SpiritualButton 
                      variant="outline" 
                      size="icon"
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full ${isMuted ? 'bg-destructive/10 text-destructive' : ''}`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </SpiritualButton>
                    
                    <SpiritualButton 
                      variant="primary" 
                      size="icon"
                      onClick={endCall}
                      className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </SpiritualButton>
                    
                    <SpiritualButton 
                      variant="outline" 
                      size="icon"
                      className="w-14 h-14 rounded-full"
                    >
                      <Volume2 className="w-6 h-6" />
                    </SpiritualButton>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-6">
                    Speak clearly • AI-powered voice consultation
                  </p>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
