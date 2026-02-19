import { useEffect } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const JotshiLogin = () => {
  const { prevStep, completeOnboarding } = useOnboardingStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, go straight to provider registration
  useEffect(() => {
    if (user) {
      completeOnboarding();
      navigate("/provider-register", { replace: true });
    }
  }, [user, completeOnboarding, navigate]);

  // If not authenticated, redirect to auth page with a return path
  const handleSignIn = () => {
    navigate("/auth?redirect=/provider-register");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-dvh px-6 py-8"
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-24 h-24 rounded-3xl bg-gradient-mystic flex items-center justify-center shadow-mystic mb-8"
        >
          <Moon className="w-12 h-12 text-secondary-foreground" />
        </motion.div>

        <h1 className="text-3xl font-bold text-center mb-2 font-display">
          Become a Jotshi
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Sign in to continue with your expert registration
        </p>

        <SpiritualButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSignIn}
        >
          Sign In to Continue
        </SpiritualButton>
      </div>

      <div className="max-w-md mx-auto w-full">
        <SpiritualButton
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={prevStep}
        >
          ← Back to Welcome
        </SpiritualButton>
      </div>
    </motion.div>
  );
};

export default JotshiLogin;
