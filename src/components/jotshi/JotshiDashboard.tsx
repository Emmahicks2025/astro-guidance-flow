import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Moon, 
  Users, 
  MessageCircle, 
  Wallet, 
  Star, 
  Settings, 
  Bell,
  ChevronRight,
  Clock,
  TrendingUp
} from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { toast } from "sonner";
import NorthIndianKundliChart from "@/components/kundli/NorthIndianKundliChart";
import { generateSampleKundli } from "@/lib/kundli";
import JotshiConsultationPanel from "./JotshiConsultationPanel";

// Mock data for active users
const activeUsers = [
  {
    id: '1',
    name: 'Priya Sharma',
    concern: 'Marriage & Love',
    birthDate: '15 Aug 1995',
    birthTime: '10:30 AM',
    birthPlace: 'Delhi, India',
    waitTime: '2 min',
    status: 'waiting',
    gender: 'female',
    birthTimeExactness: 'exact',
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    concern: 'Career & Business',
    birthDate: '22 Mar 1988',
    birthTime: '06:15 AM',
    birthPlace: 'Mumbai, Maharashtra',
    waitTime: '5 min',
    status: 'waiting',
    gender: 'male',
    birthTimeExactness: 'approximate',
  },
  {
    id: '3',
    name: 'Anita Patel',
    concern: 'Finance & Wealth',
    birthDate: '08 Dec 1992',
    birthTime: '11:45 PM',
    birthPlace: 'Ahmedabad, Gujarat',
    waitTime: '8 min',
    status: 'waiting',
    gender: 'female',
    birthTimeExactness: 'exact',
  },
];

const JotshiDashboard = () => {
  const { resetOnboarding } = useOnboardingStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeConsultation, setActiveConsultation] = useState<typeof activeUsers[0] | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // If in active consultation, show the consultation panel
  if (activeConsultation) {
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
            <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg">Jotshi Portal</span>
              <span className="block text-xs opacity-75">Astrologer Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SpiritualButton 
              variant="ghost" 
              size="icon" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
              onClick={() => toast.info("Notifications coming soon!")}
            >
              <Bell className="w-5 h-5" />
            </SpiritualButton>
            <SpiritualButton 
              variant="ghost" 
              size="icon" 
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
              onClick={() => toast.info("Settings coming soon!")}
            >
              <Settings className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <SpiritualCard variant="mystic" className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">{activeUsers.length}</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </SpiritualCard>
          <SpiritualCard variant="spiritual" className="p-4 text-center">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Today's Sessions</p>
          </SpiritualCard>
          <SpiritualCard variant="golden" className="p-4 text-center">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">$2,450</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </SpiritualCard>
        </motion.div>

        {/* Online Status */}
        <motion.div variants={itemVariants}>
          <SpiritualCard variant="elevated" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="font-medium">{isOnline ? 'You are Online' : 'You are Offline'}</span>
              </div>
              <SpiritualButton 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsOnline(!isOnline);
                  toast.success(isOnline ? "You are now offline" : "You are now online");
                }}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </SpiritualButton>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* User Queue */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Waiting Users
            </h3>
            <span className="text-sm text-muted-foreground">{activeUsers.length} in queue</span>
          </div>

          <div className="space-y-3">
            {activeUsers.map((user, index) => {
              const kundliData = generateSampleKundli(new Date(user.birthDate), user.birthTime, user.birthPlace);
              
              return (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <SpiritualCard
                    variant={selectedUser === user.id ? "spiritual" : "elevated"}
                    interactive
                    className="overflow-hidden"
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                  >
                    <SpiritualCardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <span className="text-sm text-primary">{user.concern}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {user.waitTime}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                        <div>
                          <span className="block font-medium text-foreground">Birth Date</span>
                          {user.birthDate}
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">Time</span>
                          {user.birthTime}
                          {user.birthTimeExactness !== 'exact' && (
                            <span className="text-yellow-600"> ~</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">Place</span>
                          {user.birthPlace}
                        </div>
                      </div>

                      {selectedUser === user.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-3 border-t border-border space-y-3"
                        >
                          {/* Live Kundli Chart Preview */}
                          <div className="flex justify-center">
                            <NorthIndianKundliChart data={kundliData} size={180} showLabels={false} />
                          </div>
                          <div className="text-center text-sm">
                            <span className="text-primary font-medium">{kundliData.lagnaSign}</span>
                            <span className="text-muted-foreground"> Lagna • </span>
                            <span className="text-accent">{kundliData.nakshatras.moon}</span>
                            <span className="text-muted-foreground"> Nakshatra</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <SpiritualButton 
                              variant="primary" 
                              size="lg" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveConsultation(user);
                              }}
                            >
                              <MessageCircle className="w-5 h-5" />
                              Start Consultation
                            </SpiritualButton>
                            <SpiritualButton 
                              variant="outline" 
                              size="lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveConsultation(user);
                              }}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </SpiritualButton>
                          </div>
                        </motion.div>
                      )}
                    </SpiritualCardContent>
                  </SpiritualCard>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Performance */}
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
                  4.8 <Star className="w-4 h-4 text-accent fill-accent" />
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-xl font-bold">1,247</p>
              </div>
            </div>
          </SpiritualCard>
        </motion.section>

        {/* Dev: Reset button */}
        <motion.div variants={itemVariants} className="pt-4">
          <button
            onClick={resetOnboarding}
            className="text-sm text-muted-foreground underline"
          >
            Reset to Welcome (Dev)
          </button>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default JotshiDashboard;
