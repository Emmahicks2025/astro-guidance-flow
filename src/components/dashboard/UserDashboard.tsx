import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Hand, Heart, Sun, Star, Wallet, User, Settings, Book, Calendar, HelpCircle, LogOut } from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useWalkthroughStore } from "@/stores/walkthroughStore";
import { useTranslation } from "@/stores/languageStore";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserProfile } from "@/lib/profileService";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import jotshiWoman from "@/assets/jotshi-woman.jpg";
import AppWalkthrough from "@/components/walkthrough/AppWalkthrough";
import FloatingChatBadge from "@/components/chat/FloatingChatBadge";
import NotificationBell from "@/components/chat/NotificationBell";
import { ExpertConsultationDialog } from "@/components/consultation/ExpertConsultationDialog";
import { SeekerConversation } from "@/hooks/useSeekerConversations";
import { supabase } from "@/integrations/supabase/client";
import PullToRefresh from "@/components/dashboard/PullToRefresh";

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
        // Sync tutorial_completed from DB to local store
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

  const handleLogout = async () => {
    await signOut();
    resetOnboarding();
    navigate('/auth');
  };

  const serviceCards = [
    {
      id: 'talk',
      title: t.talkToJotshi,
      description: t.talkToJotshiDesc,
      icon: MessageCircle,
      gradient: 'from-primary to-primary-dark',
      variant: 'spiritual' as const,
      path: '/talk',
    },
    {
      id: 'palm',
      title: t.palmReading,
      description: t.palmReadingDesc,
      icon: Hand,
      gradient: 'from-accent to-accent-dark',
      variant: 'golden' as const,
      path: '/palm-reading',
    },
    {
      id: 'compatibility',
      title: t.gunaMilan,
      description: t.gunaMilanDesc,
      icon: Heart,
      gradient: 'from-secondary to-secondary-dark',
      variant: 'mystic' as const,
      path: '/compatibility',
    },
  ];

  const quickActions = [
    { icon: Star, label: t.myKundli, path: '/kundli' },
    { icon: Book, label: t.explore, path: '/explore' },
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
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* App Walkthrough */}
      <AppWalkthrough 
        isOpen={isWalkthroughOpen}
        onClose={handleWalkthroughClose}
        onComplete={handleWalkthroughComplete}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-background"
      >
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top" role="banner">
          <nav className="container mx-auto px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-gradient-spiritual">Stellar</span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell onOpenChat={openConversationFromBadge} />
              <SpiritualButton 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/messages')}
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
              </SpiritualButton>
              <SpiritualButton 
                variant="ghost" 
                size="icon" 
                onClick={openWalkthrough}
                title={t.appGuide}
              >
                <HelpCircle className="w-5 h-5" />
              </SpiritualButton>
              <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/wallet')}>
                <Wallet className="w-5 h-5" />
              </SpiritualButton>
              <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5" />
              </SpiritualButton>
              <SpiritualButton variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                <LogOut className="w-5 h-5" />
              </SpiritualButton>
            </div>
          </nav>
        </header>

        <PullToRefresh onRefresh={async () => {
          if (user) {
            const profile = await fetchUserProfile(user.id);
            if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
          }
        }}>
        <main className="container mx-auto px-4 py-6 space-y-8">
          {/* Welcome Section */}
          <motion.section variants={itemVariants}>
            <SpiritualCard variant="spiritual" className="overflow-hidden">
              <div className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Sun className="w-full h-full text-primary animate-spin-slow" />
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 shadow-spiritual">
                    <AvatarImage src={avatarUrl || undefined} alt={userData.fullName || 'User'} />
                    <AvatarFallback className="bg-gradient-spiritual text-primary-foreground text-xl">
                      {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold font-display">
                      {t.namaste}, {userData.fullName || 'Seeker'} 🙏
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {userData.dateOfBirth
                        ? `${t.bornOn} ${format(userData.dateOfBirth, 'PPP')}`
                        : t.cosmicJourneyAwaits}
                    </p>
                  </div>
                </div>
              </div>
            </SpiritualCard>
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
                    <p className="text-xs text-muted-foreground">
                      {t.newToAstrologyDesc}
                    </p>
                  </div>
                  <span className="text-secondary">→</span>
                </div>
              </SpiritualCard>
            </motion.section>
          )}

          {/* Quick Actions */}
          <motion.section variants={itemVariants}>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-soft transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-spiritual flex items-center justify-center">
                    <action.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-center whitespace-nowrap">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Services */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold font-display">{t.ourServices}</h3>
            <div className="grid gap-4">
              {serviceCards.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(service.path)}
                >
                  <SpiritualCard
                    variant={service.variant}
                    interactive
                    className="overflow-hidden cursor-pointer"
                  >
                    <SpiritualCardContent className="p-5">
                      <div className="flex items-center gap-4">
                        {service.id === 'talk' ? (
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg flex-shrink-0">
                            <img 
                              src={jotshiWoman} 
                              alt="Jotshi Astrologer" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg`}>
                            <service.icon className="w-7 h-7 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{service.title}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="text-primary">→</div>
                      </div>
                    </SpiritualCardContent>
                  </SpiritualCard>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Today's Insight */}
          <motion.section variants={itemVariants}>
            <SpiritualCard variant="golden" className="overflow-hidden">
              <SpiritualCardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t.todaysCosmicInsight}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t.todaysInsightText}
                    </p>
                  </div>
                </div>
              </SpiritualCardContent>
            </SpiritualCard>
          </motion.section>

          {/* Help Card */}
          <motion.section variants={itemVariants}>
            <SpiritualCard 
              variant="default" 
              className="p-4 cursor-pointer border-dashed"
              onClick={openWalkthrough}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t.needHelp}
                </span>
              </div>
            </SpiritualCard>
          </motion.section>

          {/* Dev: Reset button */}
          <motion.div variants={itemVariants} className="pt-4 flex gap-4">
            <button
              onClick={resetOnboarding}
              className="text-sm text-muted-foreground underline"
            >
              Reset Onboarding (Dev)
            </button>
            <button
              onClick={() => useWalkthroughStore.getState().resetWalkthrough()}
              className="text-sm text-muted-foreground underline"
            >
              Reset Tutorial (Dev)
            </button>
          </motion.div>
        </main>
        </PullToRefresh>
      </motion.div>

      {/* Floating Chat Badge */}
      <FloatingChatBadge onOpenChat={openConversationFromBadge} />

      {/* Chat Dialog triggered from badges/notifications */}
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
