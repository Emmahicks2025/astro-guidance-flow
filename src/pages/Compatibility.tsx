import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, User, Calendar, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { toast } from "sonner";

const Compatibility = () => {
  const navigate = useNavigate();
  const { userData } = useOnboardingStore();
  const [partnerData, setPartnerData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<null | { score: number; gunas: number }>(null);

  const handleCheck = () => {
    if (!partnerData.name || !partnerData.dateOfBirth) {
      toast.error("Please fill in partner's details");
      return;
    }
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      // Mock result
      const gunas = Math.floor(Math.random() * 18) + 18;
      setResult({ score: Math.round((gunas / 36) * 100), gunas });
      toast.success("Compatibility analysis complete!");
    }, 2000);
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
            <div className="w-10 h-10 rounded-full bg-gradient-mystic flex items-center justify-center">
              <Heart className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Compatibility</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Your Info */}
        <SpiritualCard variant="spiritual" className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Details</p>
              <h4 className="font-semibold">{userData.fullName || 'Your Name'}</h4>
              <p className="text-sm text-muted-foreground">
                {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Birth date not set'}
              </p>
            </div>
          </div>
        </SpiritualCard>

        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-accent" />
          </div>
        </div>

        {/* Partner Info */}
        <SpiritualCard variant="elevated" className="overflow-hidden">
          <SpiritualCardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-center">Partner's Birth Details</h3>
            
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <SpiritualInput
                  placeholder="Partner's Name"
                  className="pl-12"
                  value={partnerData.name}
                  onChange={(e) => setPartnerData({ ...partnerData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <SpiritualInput
                  type="date"
                  className="pl-12"
                  value={partnerData.dateOfBirth}
                  onChange={(e) => setPartnerData({ ...partnerData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <SpiritualInput
                  type="time"
                  className="pl-12"
                  placeholder="Birth Time (optional)"
                  value={partnerData.timeOfBirth}
                  onChange={(e) => setPartnerData({ ...partnerData, timeOfBirth: e.target.value })}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <SpiritualInput
                  placeholder="Birth Place (optional)"
                  className="pl-12"
                  value={partnerData.placeOfBirth}
                  onChange={(e) => setPartnerData({ ...partnerData, placeOfBirth: e.target.value })}
                />
              </div>
            </div>

            <SpiritualButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleCheck}
              disabled={isChecking}
            >
              {isChecking ? "Calculating Gunas..." : "Check Compatibility"}
            </SpiritualButton>
          </SpiritualCardContent>
        </SpiritualCard>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SpiritualCard variant="golden" className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Guna Milan Result</h3>
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <div>
                  <p className="text-4xl font-bold text-accent">{result.gunas}</p>
                  <p className="text-sm text-muted-foreground">out of 36</p>
                </div>
              </div>
              <p className="text-lg font-medium mb-2">
                {result.gunas >= 24 ? '💕 Excellent Match!' : result.gunas >= 18 ? '💛 Good Match' : '⚠️ Needs Remedies'}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.score}% compatibility based on Vedic astrology principles
              </p>
              <SpiritualButton variant="primary" size="lg" className="w-full mt-4">
                Get Detailed Report
              </SpiritualButton>
            </SpiritualCard>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default Compatibility;
