import { motion } from "framer-motion";
import { Target, Check, Briefcase, Heart, Activity, Coins, Scale, Sparkles } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";

const concerns = [
  { value: 'career', label: 'Career & Business', icon: Briefcase, description: '10th House analysis' },
  { value: 'love', label: 'Love & Marriage', icon: Heart, description: '7th House analysis' },
  { value: 'health', label: 'Health & Wellbeing', icon: Activity, description: '6th House analysis' },
  { value: 'finance', label: 'Finance & Wealth', icon: Coins, description: '2nd & 11th House' },
  { value: 'legal', label: 'Legal Matters', icon: Scale, description: '6th & 12th House' },
  { value: 'general', label: 'General Guidance', icon: Sparkles, description: 'Complete reading' },
];

const MajorConcernStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (value: string) => {
    updateUserData('majorConcern', value);
  };

  const handleContinue = () => {
    if (userData.majorConcern) {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-screen px-6 pt-12 pb-8 safe-area-top"
    >
      <OnboardingProgress currentStep={6} totalSteps={8} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-spiritual flex items-center justify-center shadow-spiritual mb-8 mx-auto"
        >
          <Target className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          What brings you here today?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          Select your primary area of concern for a focused analysis
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {concerns.map((concern) => {
            const Icon = concern.icon;
            const isSelected = userData.majorConcern === concern.value;
            
            return (
              <SpiritualCard
                key={concern.value}
                variant={isSelected ? "spiritual" : "elevated"}
                interactive
                className="p-4 cursor-pointer text-center"
                onClick={() => handleSelect(concern.value)}
              >
                <div className="relative">
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-medium text-sm">{concern.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{concern.description}</p>
                </div>
              </SpiritualCard>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 max-w-md mx-auto w-full safe-area-bottom"
      >
        <SpiritualButton
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={prevStep}
        >
          Back
        </SpiritualButton>
        <SpiritualButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleContinue}
          disabled={!userData.majorConcern}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default MajorConcernStep;
