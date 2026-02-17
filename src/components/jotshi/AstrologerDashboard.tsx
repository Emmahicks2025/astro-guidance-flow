import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Moon, Users, MessageCircle, Wallet, Star, Settings, Bell, LogOut,
  Clock, TrendingUp, Lock, CheckCircle, AlertCircle, ChevronRight,
  Eye, Calendar, IndianRupee, BarChart3, User, Shield, FileText
} from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import JotshiConsultationPanel from "./JotshiConsultationPanel";
import NorthIndianKundliChart from "@/components/kundli/NorthIndianKundliChart";
import { generateSampleKundli } from "@/lib/kundli";

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
}

// Mock data for active users (will be replaced with real data when approved)
const mockActiveUsers = [
  {
    id: '1', name: 'Priya Sharma', concern: 'Marriage & Love',
    birthDate: '15 Aug 1995', birthTime: '10:30 AM', birthPlace: 'Delhi, India',
    waitTime: '2 min', status: 'waiting', gender: 'female', birthTimeExactness: 'exact',
  },
  {
    id: '2', name: 'Rajesh Kumar', concern: 'Career & Business',
    birthDate: '22 Mar 1988', birthTime: '06:15 AM', birthPlace: 'Mumbai, Maharashtra',
    waitTime: '5 min', status: 'waiting', gender: 'male', birthTimeExactness: 'approximate',
  },
];

const AstrologerDashboard = () => {
  const { user, signOut } = useAuth();
  const { resetOnboarding } = useOnboardingStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<JotshiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<typeof mockActiveUsers[0] | null>(null);

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
        .maybeSingle();
      if (error) throw error;
      setProfile(data);
      setIsOnline(data?.is_online || false);
    } catch (err) {
      console.error('Error fetching jotshi profile:', err);
    } finally {
      setLoading(false);
    }
  };

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
    await supabase
      .from('jotshi_profiles')
      .update({ is_online: newStatus })
      .eq('id', profile.id);
    toast.success(newStatus ? "You are now online" : "You are now offline");
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

  if (activeConsultation && isApproved) {
    return (
      <JotshiConsultationPanel 
        user={activeConsultation}
        onBack={() => setActiveConsultation(null)}
      />
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
              <span className="font-display font-bold text-lg">
                {profile?.display_name || 'Astrologer Portal'}
              </span>
              <span className="block text-xs opacity-75 capitalize">
                {profile?.category || 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <SpiritualButton 
              variant="ghost" size="icon" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </SpiritualButton>
            <SpiritualButton 
              variant="ghost" size="icon" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Application Status Banner */}
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
                    Your application is being reviewed by our admin team. This usually takes 24-48 hours. 
                    You'll be notified once your profile is approved.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
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
                    Unfortunately, your application was not approved. Please contact support for more details 
                    or re-apply with updated information.
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
                {profile?.verified && (
                  <Shield className="w-4 h-4 text-blue-500 ml-auto" />
                )}
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
                  <span className="text-xs text-muted-foreground">
                    {profile?.experience_years || 0} yrs exp
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    ₹{profile?.hourly_rate || 0}/min
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.languages?.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* Online Toggle (only when approved) */}
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
            <p className="text-2xl font-bold">{isApproved ? mockActiveUsers.length : '—'}</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </SpiritualCard>
          <SpiritualCard variant="spiritual" className={`p-4 text-center ${!isApproved ? 'opacity-50' : ''}`}>
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{isApproved ? (profile?.total_sessions || 0) : '—'}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </SpiritualCard>
          <SpiritualCard variant="golden" className={`p-4 text-center ${!isApproved ? 'opacity-50' : ''}`}>
            <IndianRupee className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{isApproved ? `₹${profile?.total_earnings || 0}` : '—'}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </SpiritualCard>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Features</h3>
          
          {[
            { icon: Users, label: 'Client Queue', desc: 'View & accept consultation requests', locked: !isApproved },
            { icon: Calendar, label: 'Schedule', desc: 'Manage your availability', locked: !isApproved },
            { icon: BarChart3, label: 'Analytics', desc: 'View your performance metrics', locked: !isApproved },
            { icon: Wallet, label: 'Earnings', desc: 'Track income & withdrawals', locked: !isApproved },
            { icon: Eye, label: 'Profile Preview', desc: 'See how seekers view your profile', locked: false },
          ].map((item) => (
            <SpiritualCard 
              key={item.label} 
              variant="elevated" 
              className={`overflow-hidden ${item.locked ? 'opacity-60' : ''}`}
            >
              <button 
                className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors disabled:cursor-not-allowed"
                disabled={item.locked}
                onClick={() => {
                  if (item.locked) return;
                  toast.info(`${item.label} coming soon!`);
                }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.locked ? 'bg-muted' : 'bg-secondary/10'}`}>
                  {item.locked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <item.icon className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {item.locked ? (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Pending Approval</span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </SpiritualCard>
          ))}
        </motion.div>

        {/* Client Queue (only when approved & online) */}
        {isApproved && isOnline && (
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Waiting Clients
              </h3>
              <span className="text-sm text-muted-foreground">{mockActiveUsers.length} in queue</span>
            </div>

            <div className="space-y-3">
              {mockActiveUsers.map((u) => {
                const kundliData = generateSampleKundli(new Date(u.birthDate), u.birthTime, u.birthPlace);
                return (
                  <SpiritualCard
                    key={u.id}
                    variant={selectedUser === u.id ? "spiritual" : "elevated"}
                    interactive
                    className="overflow-hidden"
                    onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
                  >
                    <SpiritualCardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{u.name}</h4>
                          <span className="text-sm text-primary">{u.concern}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {u.waitTime}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block font-medium text-foreground">Birth Date</span>
                          {u.birthDate}
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">Time</span>
                          {u.birthTime}
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">Place</span>
                          {u.birthPlace}
                        </div>
                      </div>

                      {selectedUser === u.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-3 border-t border-border mt-3 space-y-3"
                        >
                          <div className="flex justify-center">
                            <NorthIndianKundliChart data={kundliData} size={180} showLabels={false} />
                          </div>
                          <div className="text-center text-sm">
                            <span className="text-primary font-medium">{kundliData.lagnaSign}</span>
                            <span className="text-muted-foreground"> Lagna • </span>
                            <span className="text-accent">{kundliData.nakshatras.moon}</span>
                          </div>
                          <SpiritualButton 
                            variant="primary" size="lg" className="w-full"
                            onClick={(e) => { e.stopPropagation(); setActiveConsultation(u); }}
                          >
                            <MessageCircle className="w-5 h-5" />
                            Start Consultation
                          </SpiritualButton>
                        </motion.div>
                      )}
                    </SpiritualCardContent>
                  </SpiritualCard>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Performance (approved only) */}
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

        {/* Quick Links */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <SpiritualButton variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/terms')}>
              <FileText className="w-5 h-5" />
              <span className="text-xs">Terms</span>
            </SpiritualButton>
            <SpiritualButton variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate('/privacy-policy')}>
              <Shield className="w-5 h-5" />
              <span className="text-xs">Privacy</span>
            </SpiritualButton>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div variants={itemVariants}>
          <SpiritualButton
            variant="outline"
            size="lg"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </SpiritualButton>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground pb-4">AstroGuru v1.0.0</p>
      </main>
    </motion.div>
  );
};

export default AstrologerDashboard;
