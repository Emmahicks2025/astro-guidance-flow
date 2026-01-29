import { motion } from "framer-motion";
import { User } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";

const NameStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const handleContinue = () => {
    if (userData.fullName.trim()) {
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
      <OnboardingProgress currentStep={1} totalSteps={6} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-spiritual flex items-center justify-center shadow-spiritual mb-8 mx-auto"
        >
          <User className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          What's your name?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          Your name carries cosmic vibrations and helps personalize your readings
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SpiritualInput
            placeholder="Enter your full name"
            value={userData.fullName}
            onChange={(e) => updateUserData('fullName', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            autoFocus
          />
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
          disabled={!userData.fullName.trim()}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default NameStep;
