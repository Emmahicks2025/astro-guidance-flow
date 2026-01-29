import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DateOfBirthStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const handleContinue = () => {
    if (userData.dateOfBirth) {
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
      <OnboardingProgress currentStep={3} totalSteps={6} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-golden flex items-center justify-center shadow-golden mb-8 mx-auto"
        >
          <Calendar className="w-10 h-10 text-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-3 font-display"
        >
          When were you born?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          Your birth date determines your Moon sign and planetary positions
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between h-14 px-4 rounded-xl border-2 transition-all duration-200",
                  "border-border bg-card shadow-soft",
                  "hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
                  userData.dateOfBirth ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span>
                  {userData.dateOfBirth
                    ? format(userData.dateOfBirth, "PPP")
                    : "Select your birth date"}
                </span>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="center">
              <CalendarComponent
                mode="single"
                selected={userData.dateOfBirth || undefined}
                onSelect={(date) => updateUserData('dateOfBirth', date || null)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={1920}
                toYear={new Date().getFullYear()}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
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
          disabled={!userData.dateOfBirth}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default DateOfBirthStep;
