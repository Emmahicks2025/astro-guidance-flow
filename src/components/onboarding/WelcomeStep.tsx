import { motion } from "framer-motion";
import { Sun, Moon, Star, Sparkles } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";

const WelcomeStep = () => {
  const { nextStep, updateUserData } = useOnboardingStore();

  const handleRoleSelect = (role: 'user' | 'jotshi') => {
    updateUserData('role', role);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-64 h-64 opacity-10"
        >
          <Sun className="w-full h-full text-primary" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-10 opacity-20"
        >
          <Star className="w-8 h-8 text-accent" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-10 opacity-20"
        >
          <Moon className="w-12 h-12 text-secondary" />
        </motion.div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative mb-8"
      >
        <div className="w-28 h-28 rounded-full bg-gradient-spiritual flex items-center justify-center shadow-spiritual">
          <Sparkles className="w-14 h-14 text-primary-foreground" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gradient-spiritual opacity-30 blur-xl"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold mb-4 text-gradient-spiritual font-display"
      >
        AstroGuru
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground mb-12 max-w-md"
      >
        Discover your cosmic destiny through the ancient wisdom of Vedic Astrology
      </motion.p>

      {/* Role Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-4"
      >
        <SpiritualButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => handleRoleSelect('user')}
        >
          <Sun className="w-5 h-5" />
          I'm Seeking Guidance
        </SpiritualButton>

        <SpiritualButton
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => handleRoleSelect('jotshi')}
        >
          <Moon className="w-5 h-5" />
          I'm a Jotshi (Astrologer)
        </SpiritualButton>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        Your journey to cosmic enlightenment begins here
      </motion.p>
    </motion.div>
  );
};

export default WelcomeStep;
