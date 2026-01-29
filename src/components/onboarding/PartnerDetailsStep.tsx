import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, User, Calendar, MapPin, Clock, Check } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { saveUserProfile, saveJotshiProfile } from "@/lib/profileService";
import { toast } from "sonner";
import OnboardingProgress from "./OnboardingProgress";

const relationshipStatuses = [
  { value: 'single', label: 'Single' },
  { value: 'dating', label: 'Dating' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'married', label: 'Married' },
  { value: 'separated', label: 'Separated' },
];

const PartnerDetailsStep = () => {
  const { userData, updateUserData, prevStep, completeOnboarding } = useOnboardingStore();
  const { user } = useAuth();
  const [partnerName, setPartnerName] = useState(userData.partnerDetails?.name || '');
  const [partnerDob, setPartnerDob] = useState(userData.partnerDetails?.dateOfBirth || '');
  const [partnerTime, setPartnerTime] = useState(userData.partnerDetails?.timeOfBirth || '');
  const [partnerPlace, setPartnerPlace] = useState(userData.partnerDetails?.placeOfBirth || '');
  const [isSaving, setIsSaving] = useState(false);

  // Only show this step for relationship-focused concerns
  const isRelationshipFocused = userData.majorConcern === 'love';

  const handleStatusSelect = (status: string) => {
    updateUserData('relationshipStatus', status as any);
  };

  const handleContinue = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setIsSaving(true);

    try {
      // Update partner details if provided
      if (isRelationshipFocused && partnerName) {
        updateUserData('partnerDetails', {
          name: partnerName,
          dateOfBirth: partnerDob,
          timeOfBirth: partnerTime,
          placeOfBirth: partnerPlace,
        });
      }

      // Save profile to database
      await saveUserProfile(user.id, {
        ...userData,
        partnerDetails: isRelationshipFocused && partnerName ? {
          name: partnerName,
          dateOfBirth: partnerDob,
          timeOfBirth: partnerTime,
          placeOfBirth: partnerPlace,
        } : null,
      });

      // If Jotshi, also create jotshi profile
      if (userData.role === 'jotshi') {
        await saveJotshiProfile(user.id, {
          specialty: 'General Astrology',
          experience_years: 1,
          hourly_rate: 20,
        });
      }

      toast.success("Profile saved successfully! 🌟");
      completeOnboarding();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      completeOnboarding();
      return;
    }

    setIsSaving(true);
    try {
      await saveUserProfile(user.id, userData);
      
      if (userData.role === 'jotshi') {
        await saveJotshiProfile(user.id, {
          specialty: 'General Astrology',
          experience_years: 1,
          hourly_rate: 20,
        });
      }
      
      toast.success("Profile saved! 🌟");
      completeOnboarding();
    } catch (error) {
      console.error('Error saving profile:', error);
      completeOnboarding();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-[80vh] px-6 py-8"
    >
      <OnboardingProgress currentStep={7} totalSteps={8} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-mystic flex items-center justify-center shadow-mystic mb-8 mx-auto"
        >
          <Heart className="w-10 h-10 text-secondary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          {isRelationshipFocused ? "Partner's Details" : "Relationship Status"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          {isRelationshipFocused 
            ? "For accurate Guna Milan and compatibility matching"
            : "This helps us understand your current situation"
          }
        </motion.p>

        {/* Relationship Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {relationshipStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusSelect(status.value)}
                className={`px-4 py-2 rounded-full border-2 transition-all ${
                  userData.relationshipStatus === status.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* Partner details form - only for love/relationship concern */}
          {isRelationshipFocused && userData.relationshipStatus && userData.relationshipStatus !== 'single' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-4"
            >
              <SpiritualCard variant="elevated" className="p-4 space-y-3">
                <h4 className="font-semibold text-center mb-2">Partner's Birth Details</h4>
                
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <SpiritualInput
                    placeholder="Partner's Name"
                    className="pl-12"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <SpiritualInput
                    type="date"
                    className="pl-12"
                    value={partnerDob}
                    onChange={(e) => setPartnerDob(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <SpiritualInput
                    type="time"
                    className="pl-12"
                    placeholder="Birth Time (if known)"
                    value={partnerTime}
                    onChange={(e) => setPartnerTime(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <SpiritualInput
                    placeholder="Birth Place (if known)"
                    className="pl-12"
                    value={partnerPlace}
                    onChange={(e) => setPartnerPlace(e.target.value)}
                  />
                </div>
              </SpiritualCard>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 max-w-md mx-auto w-full"
      >
        <SpiritualButton
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={prevStep}
          disabled={isSaving}
        >
          Back
        </SpiritualButton>
        {!isRelationshipFocused && (
          <SpiritualButton
            variant="ghost"
            size="lg"
            onClick={handleSkip}
            disabled={isSaving}
          >
            Skip
          </SpiritualButton>
        )}
        <SpiritualButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleContinue}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Complete ✨"}
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default PartnerDetailsStep;
