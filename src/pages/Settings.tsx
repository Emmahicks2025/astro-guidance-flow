import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  ArrowLeft, 
  User, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Edit2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { userData, resetOnboarding } = useOnboardingStore();
  const { signOut, user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => toast.info("Edit profile coming soon!") },
        { icon: Shield, label: 'Privacy & Security', action: () => toast.info("Privacy settings coming soon!") },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          toggle: true, 
          value: notifications, 
          action: () => setNotifications(!notifications) 
        },
        { 
          icon: Moon, 
          label: 'Dark Mode', 
          toggle: true, 
          value: darkMode, 
          action: () => setDarkMode(!darkMode) 
        },
        { icon: Globe, label: 'Language', value: 'English', action: () => toast.info("Language settings coming soon!") },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', action: () => toast.info("Help center coming soon!") },
      ]
    },
  ];

  const handleLogout = async () => {
    await signOut();
    resetOnboarding();
    toast.success("Logged out successfully");
    navigate('/auth');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Settings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <SpiritualCard variant="spiritual" className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{userData.fullName || 'Your Name'}</h2>
              <p className="text-sm text-muted-foreground">
                {user?.email || (userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not set')}
              </p>
            </div>
            <SpiritualButton variant="ghost" size="icon">
              <Edit2 className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </SpiritualCard>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <SpiritualCard variant="elevated" className="overflow-hidden">
              <div className="divide-y divide-border">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {'toggle' in item ? (
                      <div 
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.value ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                            item.value ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    ) : 'value' in item ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">{item.value}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </SpiritualCard>
          </section>
        ))}

        {/* Logout Button */}
        <SpiritualButton
          variant="outline"
          size="lg"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </SpiritualButton>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground">
          AstroGuru v1.0.0
        </p>
      </main>
    </motion.div>
  );
};

export default SettingsPage;
