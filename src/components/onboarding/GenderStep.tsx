import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";
import { cn } from "@/lib/utils";

const genderOptions = [
  { value: 'male', label: 'Male', emoji: '♂️' },
  { value: 'female', label: 'Female', emoji: '♀️' },
  { value: 'other', label: 'Other', emoji: '⚧' },
] as const;

const GenderStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (gender: 'male' | 'female' | 'other') => {
    updateUserData('gender', gender);
  };

  const handleContinue = () => {
    if (userData.gender) {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-[80vh] px-6 py-8"
    >
      <OnboardingProgress currentStep={2} totalSteps={6} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-mystic flex items-center justify-center shadow-mystic mb-8 mx-auto"
        >
          <Users className="w-10 h-10 text-secondary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          What's your gender?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          Planetary influences are interpreted differently based on gender in Vedic astrology
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {genderOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                userData.gender === option.value
                  ? "border-primary bg-primary/10 shadow-spiritual"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <span className="text-3xl mb-2">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
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
          onClick={handleContinue}
          disabled={!userData.gender}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default GenderStep;
