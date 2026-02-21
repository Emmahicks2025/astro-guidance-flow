import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  useEffect(() => {
    const steps = [
      { at: 15, text: "Loading ephemeris data..." },
      { at: 40, text: "Syncing planetary positions..." },
      { at: 65, text: "Calibrating Vedic algorithms..." },
      { at: 85, text: "Preparing your cosmic profile..." },
      { at: 100, text: "Ready ✨" },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].at);
        setStatusText(steps[i].text);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      role="alert"
      aria-live="polite"
      aria-label="Application loading"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-gradient-spiritual flex items-center justify-center shadow-spiritual">
          <Star className="w-10 h-10 text-primary-foreground" aria-hidden="true" />
        </div>

        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-gradient-spiritual">
            AstroGuru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Vedic Astrology & Guidance</p>
        </div>

        {/* Progress bar */}
        <div className="w-56 space-y-2">
          <Progress value={progress} className="h-1.5" />
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground text-center"
          >
            {statusText}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
