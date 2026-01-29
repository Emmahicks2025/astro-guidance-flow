import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";

const TimeOfBirthStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const handleContinue = () => {
    if (userData.timeOfBirth) {
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
      <OnboardingProgress currentStep={4} totalSteps={6} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-spiritual flex items-center justify-center shadow-spiritual mb-8 mx-auto"
        >
          <Clock className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          What time were you born?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          The exact birth time is crucial for calculating your Lagna (Ascendant) and divisional charts
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <SpiritualInput
            type="text"
            placeholder="e.g., 10:30 AM or 22:15"
            value={userData.timeOfBirth}
            onChange={(e) => updateUserData('timeOfBirth', e.target.value)}
            className="text-center text-xl"
          />
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: Check your birth certificate or ask family members for the exact time
          </p>
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
          disabled={!userData.timeOfBirth}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default TimeOfBirthStep;
