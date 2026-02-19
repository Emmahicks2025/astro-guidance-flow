import { useState, useEffect, useRef } from "react";
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
  Edit2,
  Trash2,
  FileText,
  Info,
  Star,
  Camera,
  Loader2,
  RotateCcw,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguageStore, useTranslation, type Language } from "@/stores/languageStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



const SettingsPage = () => {
  const navigate = useNavigate();
  const { userData, resetOnboarding } = useOnboardingStore();
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const { language, setLanguage: setAppLanguage } = useLanguageStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileName, setProfileName] = useState(userData.fullName || '');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load profile data (check both profiles and jotshi_profiles for experts)
  useEffect(() => {
    if (!user) return;
    const loadProfileData = async () => {
      // First check if user is a jotshi/expert
      const { data: jotshiData } = await supabase
        .from('jotshi_profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .limit(1);
      
      if (jotshiData?.[0]) {
        setProfileName(jotshiData[0].display_name || '');
        setProfileAvatar(jotshiData[0].avatar_url || null);
        return;
      }

      // Fallback to regular profiles
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setProfileName(data.full_name || userData.fullName || '');
        setProfileAvatar(data.avatar_url || null);
      }
    };
    loadProfileData();
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image too large. Max 50MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Please log in first.");
      return;
    }
    setIsSavingProfile(true);
    try {
      let avatarUrl: string | null = null;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        
        // Check if user is expert — upload to provider-avatars bucket
        const { data: jotshiData } = await supabase
          .from('jotshi_profiles')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        const isExpert = !!jotshiData?.[0];
        const bucket = isExpert ? 'provider-avatars' : 'user-avatars';
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
        setAvatarFile(null);
      }
      
      // Check if user is expert
      const { data: jotshiCheck } = await supabase
        .from('jotshi_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (jotshiCheck?.[0]) {
        // Update jotshi profile
        const updates: Record<string, string | null> = { display_name: profileName };
        if (avatarUrl) updates.avatar_url = avatarUrl;
        const { error } = await supabase.from('jotshi_profiles').update(updates).eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Update regular profile
        const updates: Record<string, string | null> = { full_name: profileName };
        if (avatarUrl) updates.avatar_url = avatarUrl;
        const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
        if (error) throw error;
      }
      
      toast.success("Profile updated successfully!");
      setShowEditProfile(false);
    } catch (err: any) {
      toast.error("Failed to update profile.");
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRestorePurchases = () => {
    if ((window as any).webkit?.messageHandlers?.iap) {
      (window as any).webkit.messageHandlers.iap.postMessage({ action: "restore" });
      toast.info("Restoring purchases...");
    } else {
      toast.info("Restore Purchases is available when running on your iPhone.");
    }
  };

  const settingsSections = [
    {
      title: t.account,
      items: [
        { icon: User, label: t.editProfile, action: () => setShowEditProfile(true) },
        { icon: CreditCard, label: "Plans & Credits", action: () => navigate('/pricing') },
        { icon: RotateCcw, label: "Restore Purchases", action: handleRestorePurchases },
        { icon: Shield, label: t.privacySecurity, action: () => navigate('/privacy-policy') },
      ]
    },
    {
      title: t.preferences,
      items: [
        { 
          icon: Bell, 
          label: t.notifications, 
          toggle: true, 
          value: notifications, 
          action: () => {
            setNotifications(!notifications);
            toast.success(notifications ? "Notifications turned off" : "Notifications turned on");
          }
        },
        { 
          icon: Moon, 
          label: t.darkMode, 
          toggle: true, 
          value: darkMode, 
          action: () => setDarkMode(!darkMode) 
        },
        { icon: Globe, label: t.language, value: language, action: () => setShowLanguageDialog(true) },
      ]
    },
    {
      title: t.legal,
      items: [
        { icon: FileText, label: t.termsConditions, action: () => navigate('/terms') },
        { icon: Shield, label: t.privacyPolicy, action: () => navigate('/privacy-policy') },
      ]
    },
    {
      title: t.support,
      items: [
        { icon: HelpCircle, label: t.helpFaq, action: () => navigate('/help') },
        { icon: Star, label: t.rateUs, action: () => {
          toast.success("Thank you for your support! ⭐");
        }},
        { icon: Info, label: t.appVersion, value: 'v1.0.0' },
      ]
    },
  ];

  const handleLogout = async () => {
    await signOut();
    resetOnboarding();
    toast.success("Logged out successfully");
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to delete your account.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      resetOnboarding();
      await supabase.auth.signOut();
      toast.success("Your account has been permanently deleted.");
      navigate('/auth');
    } catch (error: any) {
      toast.error("Failed to delete account. Please try again.");
      console.error("Delete account error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const availableLanguages: Language[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">{t.settings}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <SpiritualCard variant="spiritual" className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profileAvatar ? (
                <img src={profileAvatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{profileName || userData.fullName || 'Your Name'}</h2>
              <p className="text-sm text-muted-foreground">
                {user?.email || (userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not set')}
              </p>
            </div>
            <SpiritualButton variant="ghost" size="icon" onClick={() => setShowEditProfile(true)}>
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
          {t.logOut}
        </SpiritualButton>

        {/* Delete Account Button */}
        <SpiritualButton
          variant="ghost"
          size="lg"
          className="w-full text-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-5 h-5" />
          {t.deleteAccount}
        </SpiritualButton>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground pb-4">
          AstroGuru v1.0.0
        </p>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.editProfile}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center gap-3">
              <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <p className="text-xs text-muted-foreground">{t.tapPhotoToChange}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileName">{t.fullName}</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">{t.emailCannotChange}</p>
            </div>
            <SpiritualButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.loading}</> : t.saveChanges}
            </SpiritualButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.selectLanguage}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setAppLanguage(lang);
                  setShowLanguageDialog(false);
                  toast.success(`Language changed to ${lang}`);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  language === lang ? 'bg-primary/10 text-primary font-semibold border border-primary/30' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & FAQ Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.helpFaq}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {[
              { q: "How do I get my Kundli?", a: "Go to 'My Kundli' from the home screen. Enter your birth details and get an instant Vedic chart." },
              { q: "How does Palm Reading work?", a: "Upload a clear photo of your palm. Our AI analyzes your lines, mounts, and markings to give you a detailed reading." },
              { q: "Can I talk to a live astrologer?", a: "Yes! Go to 'Talk to Jotshi' and choose from our verified experts for chat or voice consultation." },
              { q: "What is Guna Milan?", a: "Guna Milan is the Vedic compatibility matching system based on 36 points (Gunas) between two birth charts." },
              { q: "How do I add money to my wallet?", a: "Go to Wallet from the home screen. You can add balance for consultations with experts." },
              { q: "Is my data safe?", a: "Absolutely. Your data is encrypted and stored securely. We never share your personal information." },
            ].map((faq, i) => (
              <div key={i} className="border-b border-border pb-3 last:border-0">
                <p className="font-semibold text-sm">{faq.q}</p>
                <p className="text-xs text-muted-foreground mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteAccountTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteAccountDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t.loading : t.yesDeleteAccount}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default SettingsPage;
