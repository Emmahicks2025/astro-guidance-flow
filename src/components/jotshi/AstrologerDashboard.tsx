import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Users, MessageCircle, Wallet, Star, Settings, Bell, LogOut,
  Clock, TrendingUp, Lock, CheckCircle, AlertCircle, ChevronRight,
  Eye, DollarSign, User, Shield, FileText,
  Send, ArrowLeft, Loader2
} from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { sendPushToUser } from "@/lib/pushNotifications";

interface JotshiProfile {
  id: string;
  display_name: string | null;
  category: string | null;
  specialty: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  bio: string | null;
  languages: string[] | null;
  approval_status: string;
  is_online: boolean | null;
  verified: boolean | null;
  avatar_url: string | null;
  rating: number | null;
  total_sessions: number | null;
  total_earnings: number | null;
  created_at: string;
  user_id: string | null;
}

interface Consultation {
  id: string;
  user_id: string;
  status: string;
  concern: string | null;
  created_at: string;
  started_at: string | null;
  user_name?: string;
  user_gender?: string | null;
  user_place?: string | null;
  user_dob?: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const AstrologerDashboard = () => {
  const { user, signOut } = useAuth();
  const { resetOnboarding } = useOnboardingStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<JotshiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeChat, setActiveChat] = useState<Consultation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('jotshi_profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
      if (error) throw error;
      const p = data?.[0] || null;
      setProfile(p);
      setIsOnline(p?.is_online || false);
    } catch (err) {
      console.error('Error fetching jotshi profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultations for this astrologer
  useEffect(() => {
    if (!user || !profile || profile.approval_status !== 'approved') return;

    const fetchConsultations = async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('jotshi_id', user.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch user names from profiles
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, gender, place_of_birth, date_of_birth')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        setConsultations(data.map(c => {
          const up = profileMap.get(c.user_id);
          return {
            ...c,
            user_name: up?.full_name || 'User',
            user_gender: up?.gender || null,
            user_place: up?.place_of_birth || null,
            user_dob: up?.date_of_birth || null,
          };
        }));
      }
    };

    fetchConsultations();

    // Subscribe to new consultations in realtime
    const channel = supabase
      .channel('astrologer-consultations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
          filter: `jotshi_id=eq.${user.id}`,
        },
        () => {
          fetchConsultations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile]);

  // Fetch chat messages when active chat changes
  useEffect(() => {
    if (!activeChat) { setChatMessages([]); return; }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('consultation_id', activeChat.id)
        .order('created_at', { ascending: true });
      if (data) setChatMessages(data);
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `consultation_id=eq.${activeChat.id}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setChatMessages(prev => [...prev, msg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat?.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages]);

  const handleSignOut = async () => {
    await signOut();
    resetOnboarding();
    toast.success("Signed out successfully");
    navigate('/auth');
  };

  const toggleOnline = async () => {
    if (!profile) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from('jotshi_profiles').update({ is_online: newStatus }).eq('id', profile.id);
    toast.success(newStatus ? "You are now online" : "You are now offline");
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeChat || !user || sendingMessage) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        consultation_id: activeChat.id,
        sender_id: user.id,
        content: inputMessage.trim(),
        message_type: 'text',
      });
      if (error) throw error;
      setInputMessage("");
      // Send push notification to the seeker
      sendPushToUser(activeChat.user_id, `Message from ${profile?.display_name || 'Expert'}`, inputMessage.trim());
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const endConsultation = async (consultationId: string) => {
    await supabase.from('consultations').update({ 
      status: 'completed', 
      ended_at: new Date().toISOString() 
    }).eq('id', consultationId);
    setActiveChat(null);
    toast.success("Consultation ended");
  };

  const isApproved = profile?.approval_status === 'approved';
  const isPending = profile?.approval_status === 'pending';
  const isRejected = profile?.approval_status === 'rejected';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No jotshi profile — redirect to registration
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-6 text-center">
        <Moon className="w-16 h-16 text-secondary" />
        <h2 className="text-xl font-bold font-display">Complete Your Registration</h2>
        <p className="text-muted-foreground">You need to register as a provider to access the Jotshi Portal.</p>
        <SpiritualButton variant="primary" size="lg" onClick={() => navigate('/provider-register')}>
          Register Now
        </SpiritualButton>
        <SpiritualButton variant="ghost" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </SpiritualButton>
      </div>
    );
  }

  // Active chat view
  if (activeChat) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground safe-area-top">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <SpiritualButton variant="ghost" size="icon" className="text-secondary-foreground" onClick={() => setActiveChat(null)}>
              <ArrowLeft className="w-5 h-5" />
            </SpiritualButton>
            <div className="flex-1">
              <h3 className="font-bold">{activeChat.user_name}</h3>
              <p className="text-xs opacity-75">{activeChat.concern || 'Consultation'}</p>
            </div>
            <SpiritualButton 
              variant="ghost" size="sm" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10 text-xs"
              onClick={() => endConsultation(activeChat.id)}
            >
              End Session
            </SpiritualButton>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No messages yet. The seeker is waiting for your guidance.</p>
              </div>
            )}
            {chatMessages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMe
                      ? 'bg-secondary text-secondary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] opacity-50 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background safe-area-bottom">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <SpiritualInput
              placeholder="Type your guidance..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
            />
            <SpiritualButton type="submit" variant="primary" size="icon" disabled={!inputMessage.trim() || sendingMessage}>
              {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </SpiritualButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="font-display font-bold text-lg">{profile?.display_name || 'Astrologer Portal'}</span>
              <span className="block text-xs opacity-75 capitalize">{profile?.category || 'Dashboard'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <SpiritualButton variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary-foreground/10" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5" />
            </SpiritualButton>
            <SpiritualButton variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary-foreground/10" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Status Banners */}
        {isPending && (
          <motion.div variants={itemVariants}>
            <SpiritualCard className="p-5 border-2 border-accent/50 bg-accent/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">Application Under Review</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your application is being reviewed. This usually takes 24-48 hours.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1, delay: 0.5 }} />
                    </div>
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  </div>
                </div>
              </div>
            </SpiritualCard>
          </motion.div>
        )}

        {isRejected && (
          <motion.div variants={itemVariants}>
            <SpiritualCard className="p-5 border-2 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">Application Not Approved</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please contact support or re-apply with updated information.
                  </p>
                </div>
              </div>
            </SpiritualCard>
          </motion.div>
        )}

        {isApproved && (
          <motion.div variants={itemVariants}>
            <SpiritualCard className="p-4 border-2 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-foreground">Profile Verified & Approved</span>
                {profile?.verified && <Shield className="w-4 h-4 text-blue-500 ml-auto" />}
              </div>
            </SpiritualCard>
          </motion.div>
        )}

        {/* Profile Summary */}
        <motion.div variants={itemVariants}>
          <SpiritualCard variant="elevated" className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-secondary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{profile?.display_name}</h2>
                <p className="text-sm text-muted-foreground capitalize">{profile?.specialty}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{profile?.experience_years || 0} yrs exp</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">${profile?.hourly_rate || 0}/min</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{profile?.languages?.join(', ')}</span>
                </div>
              </div>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* Online Toggle */}
        {isApproved && (
          <motion.div variants={itemVariants}>
            <SpiritualCard variant="elevated" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                  <span className="font-medium">{isOnline ? 'You are Online' : 'You are Offline'}</span>
                </div>
                <SpiritualButton variant="outline" size="sm" onClick={toggleOnline}>
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </SpiritualButton>
              </div>
            </SpiritualCard>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <SpiritualCard variant="mystic" className={`p-4 text-center ${!isApproved ? 'opacity-50' : ''}`}>
            <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">{isApproved ? consultations.length : '—'}</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </SpiritualCard>
          <SpiritualCard variant="spiritual" className={`p-4 text-center ${!isApproved ? 'opacity-50' : ''}`}>
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{isApproved ? (profile?.total_sessions || 0) : '—'}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </SpiritualCard>
          <SpiritualCard variant="golden" className={`p-4 text-center ${!isApproved ? 'opacity-50' : ''}`}>
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{isApproved ? `$${profile?.total_earnings || 0}` : '—'}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </SpiritualCard>
        </motion.div>

        {/* Live Consultations Queue */}
        {isApproved && isOnline && (
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Live Consultations
              </h3>
              {consultations.length > 0 && (
                <Badge variant="secondary" className="animate-pulse">{consultations.length} active</Badge>
              )}
            </div>

            {consultations.length === 0 ? (
              <SpiritualCard className="p-8 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No consultations right now. Stay online to receive requests.</p>
              </SpiritualCard>
            ) : (
              <div className="space-y-3">
                {consultations.map((consultation) => (
                  <SpiritualCard key={consultation.id} variant="elevated" interactive className="overflow-hidden">
                    <button className="w-full p-4 text-left" onClick={() => setActiveChat(consultation)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{consultation.user_name}</h4>
                            <p className="text-xs text-muted-foreground">{consultation.concern || 'General consultation'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={consultation.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {consultation.status === 'active' ? 'Active' : 'Waiting'}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      {/* User details row */}
                      {(consultation.user_gender || consultation.user_dob || consultation.user_place) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1 mb-2 ml-[52px]">
                          {consultation.user_gender && <span className="capitalize">{consultation.user_gender}</span>}
                          {consultation.user_dob && <span>DOB: {new Date(consultation.user_dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          {consultation.user_place && <span>{consultation.user_place}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(consultation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </button>
                  </SpiritualCard>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
          {[
            { icon: User, label: 'Edit Profile', desc: 'Update your name, bio, pricing & photo', locked: false, route: '/expert-profile-edit' },
            { icon: Wallet, label: 'Earnings', desc: 'View your earnings & payouts', locked: !isApproved, route: '#' },
            { icon: FileText, label: 'Terms', desc: 'Terms & conditions', locked: false, route: '/terms' },
            { icon: Shield, label: 'Privacy', desc: 'Privacy policy', locked: false, route: '/privacy-policy' },
          ].map((item) => (
            <SpiritualCard key={item.label} variant="elevated" className={`overflow-hidden ${item.locked ? 'opacity-60' : ''}`}>
              <button 
                className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors disabled:cursor-not-allowed"
                disabled={item.locked}
                onClick={() => { if (!item.locked) navigate(item.route); }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.locked ? 'bg-muted' : 'bg-secondary/10'}`}>
                  {item.locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <item.icon className="w-5 h-5 text-secondary" />}
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {item.locked ? (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Pending</span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </SpiritualCard>
          ))}
        </motion.div>

        {/* Performance */}
        {isApproved && (
          <motion.section variants={itemVariants}>
            <SpiritualCard variant="default" className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Your Performance</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold flex items-center gap-1">
                    {profile?.rating || '0.0'} <Star className="w-4 h-4 text-accent fill-accent" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-xl font-bold">{profile?.total_sessions || 0}</p>
                </div>
              </div>
            </SpiritualCard>
          </motion.section>
        )}


        {/* Sign Out */}
        <motion.div variants={itemVariants}>
          <SpiritualButton
            variant="outline" size="lg"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </SpiritualButton>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground pb-4">AstroGuru v1.0.0</p>
      </main>
    </motion.div>
  );
};

export default AstrologerDashboard;
