import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const defaultSteps = [
  "Initializing Neural Engine...",
  "Syncing Ephemeris Data...",
  "Calibrating Planetary Positions...",
  "Rendering SVG Vector Map...",
  "Finalizing Analysis...",
];

interface CalculatingOverlayProps {
  isActive: boolean;
  steps?: string[];
  onComplete?: () => void;
  duration?: number; // total ms, default 1500
}

const CalculatingOverlay = ({ 
  isActive, 
  steps = defaultSteps, 
  onComplete,
  duration = 1500 
}: CalculatingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setStepIndex(0);
      return;
    }

    const stepDuration = duration / steps.length;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 2, 100);
        if (next >= 100) {
          clearInterval(progressInterval);
          onComplete?.();
        }
        return next;
      });
    }, duration / 50);

    const stepInterval = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isActive, steps.length, duration, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center"
          role="status"
          aria-label="Processing"
        >
          <div className="w-72 space-y-6 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent"
            />
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm font-medium text-foreground"
                >
                  {steps[stepIndex]}
                </motion.p>
              </AnimatePresence>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalculatingOverlay;
