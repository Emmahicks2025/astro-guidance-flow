import { motion } from "framer-motion";
import { Sparkles, Briefcase, Heart, Stethoscope, Coins, Scale } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";
import { cn } from "@/lib/utils";

const purposeOptions = [
  { value: 'career', label: 'Career & Business', icon: Briefcase, color: 'from-primary/20 to-primary/5' },
  { value: 'marriage', label: 'Marriage & Love', icon: Heart, color: 'from-pink-500/20 to-pink-500/5' },
  { value: 'health', label: 'Health & Wellness', icon: Stethoscope, color: 'from-green-500/20 to-green-500/5' },
  { value: 'finance', label: 'Finance & Wealth', icon: Coins, color: 'from-accent/20 to-accent/5' },
  { value: 'legal', label: 'Legal Matters', icon: Scale, color: 'from-secondary/20 to-secondary/5' },
  { value: 'general', label: 'General Guidance', icon: Sparkles, color: 'from-primary/20 to-secondary/5' },
];

const PurposeStep = () => {
  const { userData, updateUserData, completeOnboarding, prevStep } = useOnboardingStore();

  const handleSelect = (purpose: string) => {
    updateUserData('purpose', purpose);
  };

  const handleComplete = () => {
    if (userData.purpose) {
      completeOnboarding();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-[80vh] px-6 py-8"
    >
      <OnboardingProgress currentStep={6} totalSteps={6} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-golden flex items-center justify-center shadow-golden mb-8 mx-auto"
        >
          <Sparkles className="w-10 h-10 text-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          What brings you here?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          This helps our Jotshis focus on your specific area of concern
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {purposeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
                `bg-gradient-to-br ${option.color}`,
                userData.purpose === option.value
                  ? "border-primary shadow-spiritual scale-[1.02]"
                  : "border-border hover:border-primary/50"
              )}
            >
              <option.icon className="w-6 h-6 mb-2 text-foreground" />
              <span className="text-sm font-medium text-center">{option.label}</span>
            </button>
          ))}
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
        >
          Back
        </SpiritualButton>
        <SpiritualButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleComplete}
          disabled={!userData.purpose}
        >
          Start My Journey ✨
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default PurposeStep;
