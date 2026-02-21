import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Hand, Heart, Sun, Star, User, Book, Calendar, HelpCircle } from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useWalkthroughStore } from "@/stores/walkthroughStore";
import { useTranslation } from "@/stores/languageStore";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserProfile } from "@/lib/profileService";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import stellarLogo from "@/assets/stellar-logo.png";
import jotshiWoman from "@/assets/jotshi-woman.jpg";
import AppWalkthrough from "@/components/walkthrough/AppWalkthrough";
import FloatingChatBadge from "@/components/chat/FloatingChatBadge";
import NotificationBell from "@/components/chat/NotificationBell";
import { ExpertConsultationDialog } from "@/components/consultation/ExpertConsultationDialog";
import { SeekerConversation } from "@/hooks/useSeekerConversations";
import { supabase } from "@/integrations/supabase/client";
import PullToRefresh from "@/components/dashboard/PullToRefresh";
import BottomTabBar from "@/components/dashboard/BottomTabBar";

const UserDashboard = () => {
  const { userData, resetOnboarding } = useOnboardingStore();
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const openConversationFromBadge = async (convo: SeekerConversation) => {
    const { data: jotshiProfile } = await supabase
      .from('jotshi_profiles')
      .select('*')
      .eq('user_id', convo.expertId)
      .maybeSingle();
    if (jotshiProfile) {
      setSelectedExpert({
        id: jotshiProfile.id,
        name: jotshiProfile.display_name || 'Expert',
        specialty: jotshiProfile.specialty || 'Astrology',
        experience: `${jotshiProfile.experience_years || 0}+ years`,
        rating: Number(jotshiProfile.rating) || 0,
        rate: jotshiProfile.hourly_rate || 20,
        status: jotshiProfile.is_online ? 'online' as const : 'offline' as const,
        avatar: jotshiProfile.avatar_url || '',
        category: jotshiProfile.category || 'astrologer',
        languages: jotshiProfile.languages || ['Hindi', 'English'],
        sessions: jotshiProfile.total_sessions || 0,
        ai_personality: jotshiProfile.ai_personality || undefined,
        voice_id: jotshiProfile.voice_id || undefined,
        user_id: jotshiProfile.user_id || undefined,
        first_message: jotshiProfile.first_message || undefined,
      });
      setChatDialogOpen(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id).then((profile) => {
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile?.tutorial_completed) {
          setWalkthroughComplete();
        }
      });
    }
  }, [user]);

  const { t } = useTranslation();
  const { 
    hasCompletedWalkthrough, 
    isWalkthroughOpen, 
    openWalkthrough, 
    closeWalkthrough, 
    setWalkthroughComplete 
  } = useWalkthroughStore();
  const navigate = useNavigate();

  const handleWalkthroughComplete = async () => {
    setWalkthroughComplete();
    if (user) {
      await supabase.from('profiles').update({ tutorial_completed: true }).eq('user_id', user.id);
    }
  };

  const handleWalkthroughClose = async () => {
    closeWalkthrough();
    if (user) {
      await supabase.from('profiles').update({ tutorial_completed: true }).eq('user_id', user.id);
    }
  };

  const serviceCards = [
    {
      id: 'talk',
      title: t.talkToJotshi,
      icon: MessageCircle,
      gradient: 'from-primary to-primary-dark',
      variant: 'spiritual' as const,
      path: '/talk',
    },
    {
      id: 'palm',
      title: t.palmReading,
      icon: Hand,
      gradient: 'from-accent to-accent-dark',
      variant: 'golden' as const,
      path: '/palm-reading',
    },
    {
      id: 'compatibility',
      title: t.gunaMilan,
      icon: Heart,
      gradient: 'from-secondary to-secondary-dark',
      variant: 'mystic' as const,
      path: '/compatibility',
    },
    {
      id: 'explore',
      title: t.explore,
      icon: Book,
      gradient: 'from-primary to-primary-dark',
      variant: 'spiritual' as const,
      path: '/explore',
    },
  ];

  const quickActions = [
    { icon: Star, label: t.myKundli, path: '/kundli' },
    { icon: Calendar, label: t.panchang, path: '/panchang' },
    { icon: Sun, label: t.horoscope, path: '/horoscope' },
  ];

  // Auto-open walkthrough for first-time users
  useEffect(() => {
    if (!hasCompletedWalkthrough) {
      const timer = setTimeout(() => {
        openWalkthrough();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedWalkthrough, openWalkthrough]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <AppWalkthrough 
        isOpen={isWalkthroughOpen}
        onClose={handleWalkthroughClose}
        onComplete={handleWalkthroughComplete}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-background pb-24"
      >
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 bg-primary backdrop-blur-lg border-b border-primary-foreground/10 safe-area-top" role="banner">
          <nav className="container mx-auto px-4 py-3 flex items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-2.5">
              <img src={stellarLogo} alt="Stellar" className="w-9 h-9 rounded-xl" />
              <span className="font-display font-bold text-lg text-primary-foreground">Stellar</span>
            </div>
            <div className="flex items-center gap-0.5">
              <NotificationBell onOpenChat={openConversationFromBadge} />
              <button
                onClick={openWalkthrough}
                className="p-2 rounded-full text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                title={t.appGuide}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </header>

        <PullToRefresh onRefresh={async () => {
          if (user) {
            const profile = await fetchUserProfile(user.id);
            if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
          }
        }}>
        <main className="container mx-auto px-4 py-5 space-y-6">
          
          {/* Hero Banner — Daily Cosmic Insight */}
          <motion.section variants={itemVariants}>
            <SpiritualCard variant="spiritual" className="overflow-hidden">
              <div className="relative p-5">
                <div className="absolute top-0 right-0 w-28 h-28 opacity-10">
                  <Sun className="w-full h-full text-primary-foreground animate-spin-slow" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12 shadow-spiritual">
                    <AvatarImage src={avatarUrl || undefined} alt={userData.fullName || 'User'} />
                    <AvatarFallback className="bg-primary/20 text-primary-foreground text-lg">
                      {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-bold font-display text-primary-foreground">
                      {t.namaste}, {userData.fullName || 'Seeker'} 🙏
                    </h2>
                    <p className="text-xs text-primary-foreground/70">
                      {userData.dateOfBirth
                        ? `${t.bornOn} ${format(userData.dateOfBirth, 'PPP')}`
                        : t.cosmicJourneyAwaits}
                    </p>
                  </div>
                </div>
                {/* Inline daily insight */}
                <div className="bg-primary-foreground/10 rounded-xl p-3 mt-2">
                  <p className="text-xs text-primary-foreground/90 leading-relaxed">
                    ✨ {t.todaysInsightText}
                  </p>
                </div>
              </div>
            </SpiritualCard>
          </motion.section>

          {/* Quick Actions Row */}
          <motion.section variants={itemVariants}>
            <div className="flex gap-3 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-1.5 flex-1 max-w-[100px] p-3 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Services — 2×2 Compact Grid */}
          <motion.section variants={itemVariants} className="space-y-3">
            <h3 className="text-base font-bold font-display">{t.ourServices}</h3>
            <div className="grid grid-cols-2 gap-3">
              {serviceCards.map((service) => (
                <motion.div
                  key={service.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(service.path)}
                >
                  <SpiritualCard
                    variant={service.variant}
                    interactive
                    className="cursor-pointer h-full"
                  >
                    <SpiritualCardContent className="p-4 flex flex-col items-center text-center gap-2">
                      {service.id === 'talk' ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-foreground/30 shadow-lg">
                          <img 
                            src={jotshiWoman} 
                            alt="Jotshi" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl bg-primary-foreground/15 flex items-center justify-center`}>
                          <service.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm leading-tight">{service.title}</h4>
                    </SpiritualCardContent>
                  </SpiritualCard>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* First-time user hint */}
          {!hasCompletedWalkthrough && (
            <motion.section variants={itemVariants}>
              <SpiritualCard 
                variant="mystic" 
                className="p-4 cursor-pointer"
                onClick={openWalkthrough}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{t.newToAstrology}</h4>
                    <p className="text-xs text-muted-foreground">{t.newToAstrologyDesc}</p>
                  </div>
                  <span className="text-secondary">→</span>
                </div>
              </SpiritualCard>
            </motion.section>
          )}
        </main>
        </PullToRefresh>

        {/* Bottom Tab Bar */}
        <BottomTabBar />
      </motion.div>

      <FloatingChatBadge onOpenChat={openConversationFromBadge} />

      <ExpertConsultationDialog
        expert={selectedExpert}
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        initialTab="chat"
      />
    </>
  );
};

export default UserDashboard;
