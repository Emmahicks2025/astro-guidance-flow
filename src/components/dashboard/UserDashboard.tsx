import { useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Hand, Heart, Sun, Star, Wallet, User, Settings, Book, Calendar, HelpCircle } from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useWalkthroughStore } from "@/stores/walkthroughStore";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import jotshiWoman from "@/assets/jotshi-woman.jpg";
import AppWalkthrough from "@/components/walkthrough/AppWalkthrough";

const serviceCards = [
  {
    id: 'talk',
    title: 'Talk to Jotshi',
    description: 'Live consultation with expert Vedic astrologers',
    icon: MessageCircle,
    gradient: 'from-primary to-primary-dark',
    variant: 'spiritual' as const,
    path: '/talk',
  },
  {
    id: 'palm',
    title: 'Palm Reading',
    description: 'Upload your palm for detailed analysis',
    icon: Hand,
    gradient: 'from-accent to-accent-dark',
    variant: 'golden' as const,
    path: '/palm-reading',
  },
  {
    id: 'compatibility',
    title: 'Guna Milan',
    description: '36-point Kundli matching & compatibility',
    icon: Heart,
    gradient: 'from-secondary to-secondary-dark',
    variant: 'mystic' as const,
    path: '/compatibility',
  },
];

const quickActions = [
  { icon: Star, label: 'My Kundli', path: '/kundli' },
  { icon: Book, label: 'Explore', path: '/explore' },
  { icon: Calendar, label: 'Panchang', path: '/panchang' },
  { icon: Sun, label: 'Horoscope', path: '/horoscope' },
];

const UserDashboard = () => {
  const { userData, resetOnboarding } = useOnboardingStore();
  const { 
    hasCompletedWalkthrough, 
    isWalkthroughOpen, 
    openWalkthrough, 
    closeWalkthrough, 
    setWalkthroughComplete 
  } = useWalkthroughStore();
  const navigate = useNavigate();

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
        onClose={closeWalkthrough}
        onComplete={setWalkthroughComplete}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-background"
      >
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-gradient-spiritual">AstroGuru</span>
            </div>
            <div className="flex items-center gap-2">
              <SpiritualButton 
                variant="ghost" 
                size="icon" 
                onClick={openWalkthrough}
                title="App Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </SpiritualButton>
              <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/wallet')}>
                <Wallet className="w-5 h-5" />
              </SpiritualButton>
              <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="w-5 h-5" />
              </SpiritualButton>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-8">
          {/* Welcome Section */}
          <motion.section variants={itemVariants}>
            <SpiritualCard variant="spiritual" className="overflow-hidden">
              <div className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Sun className="w-full h-full text-primary animate-spin-slow" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-spiritual flex items-center justify-center shadow-spiritual">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display">
                      Namaste, {userData.fullName || 'Seeker'} 🙏
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {userData.dateOfBirth
                        ? `Born on ${format(userData.dateOfBirth, 'PPP')}`
                        : 'Your cosmic journey awaits'}
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
                    <h4 className="font-semibold text-sm">New to Astrology?</h4>
                    <p className="text-xs text-muted-foreground">
                      Tap here for a guided tour of the app and learn astrology basics
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
            <h3 className="text-lg font-bold font-display">Our Services</h3>
            <div className="grid gap-4">
              {serviceCards.map((service, index) => (
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
                    <h4 className="font-semibold mb-1">Today's Cosmic Insight</h4>
                    <p className="text-sm text-muted-foreground">
                      The planets align favorably for new beginnings. Trust your intuition 
                      and take that first step towards your goals. Venus blesses matters of the heart.
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
                  Need help? Tap here for the app guide
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
      </motion.div>
    </>
  );
};

export default UserDashboard;
