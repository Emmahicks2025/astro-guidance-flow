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
  const [callDuration, setCallDuration] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (open && expert) {
      // Reset state when opening with a new expert
      setMessages([]);
      setInputMessage("");
      setIsCallActive(false);
      setCallDuration(0);
    }
  }, [open, expert?.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
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
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, messages, expert, isLoading]);

  const startCall = async () => {
    if (!expert) return;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsCallActive(true);
      toast.success(`Connected with ${expert.name}`);
      
      // Note: Full ElevenLabs integration requires an Agent ID
      // For now, we show the call UI - voice integration can be added
      // when ElevenLabs Agents are configured
      
    } catch (error) {
      console.error("Microphone access error:", error);
      toast.error("Please enable microphone access to use voice calls.");
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    toast.info(`Call ended - Duration: ${formatDuration(callDuration)}`);
  };

  if (!expert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <TabsTrigger value="call" className="gap-2">
              <Phone className="w-4 h-4" />
              Call
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
                    disabled={expert.status !== 'online'}
                  >
                    <Phone className="w-5 h-5" />
                    Start Call
                  </SpiritualButton>
                  
                  {expert.status !== 'online' && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Expert is currently offline
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-green-500 mx-auto">
                      <img 
                        src={expert.avatar} 
                        alt={expert.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-green-500/50"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-1">{expert.name}</h3>
                  <p className="text-green-500 font-medium mb-2">Connected</p>
                  <p className="text-2xl font-mono text-foreground mb-8">
                    {formatDuration(callDuration)}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <SpiritualButton 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
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
                    Voice call with AI assistant
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
