import { motion } from "framer-motion";
import { HelpCircle, Check } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";

const options = [
  { 
    value: 'exact', 
    label: 'Yes, exact time', 
    description: 'I have verified my birth certificate or hospital records' 
  },
  { 
    value: 'approximate', 
    label: 'Approximately known', 
    description: 'Within 15-30 minutes based on family memory' 
  },
  { 
    value: 'unknown', 
    label: 'Not sure', 
    description: 'I only know if it was morning, afternoon, or night' 
  },
];

const BirthTimeExactnessStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (value: string) => {
    updateUserData('birthTimeExactness', value as 'exact' | 'approximate' | 'unknown');
  };

  const handleContinue = () => {
    if (userData.birthTimeExactness) {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col flex-1 px-6"
    >
      <OnboardingProgress currentStep={5} totalSteps={8} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-spiritual flex items-center justify-center shadow-spiritual mb-8 mx-auto"
        >
          <HelpCircle className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          Is your birth time exact?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          This helps our Jotshis determine if Birth Time Rectification is needed
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {options.map((option) => (
            <SpiritualCard
              key={option.value}
              variant={userData.birthTimeExactness === option.value ? "spiritual" : "elevated"}
              interactive
              className="p-4 cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  userData.birthTimeExactness === option.value
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {userData.birthTimeExactness === option.value && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </SpiritualCard>
          ))}
        </motion.div>

        {userData.birthTimeExactness === 'unknown' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-accent text-center mt-4"
          >
            💡 Don't worry! Our Jotshis can perform Birth Time Rectification to estimate your exact time.
          </motion.p>
        )}
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
          disabled={!userData.birthTimeExactness}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default BirthTimeExactnessStep;
