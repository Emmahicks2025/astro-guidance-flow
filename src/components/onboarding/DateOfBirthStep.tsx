import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingProgress from "./OnboardingProgress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DateOfBirthStep = () => {
  const { userData, updateUserData, nextStep, prevStep } = useOnboardingStore();

  const existing = userData.dateOfBirth ? new Date(userData.dateOfBirth) : null;

  const [month, setMonth] = useState<string>(
    existing ? String(existing.getMonth()) : ""
  );
  const [day, setDay] = useState<string>(
    existing ? String(existing.getDate()) : ""
  );
  const [year, setYear] = useState<string>(
    existing ? String(existing.getFullYear()) : ""
  );

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  const years = useMemo(
    () => Array.from({ length: maxYear - 1919 }, (_, i) => maxYear - i),
    [maxYear]
  );

  const daysInMonth = useMemo(() => {
    if (month === "" || year === "") return 31;
    return new Date(Number(year), Number(month) + 1, 0).getDate();
  }, [month, year]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  // Auto-correct day if it exceeds new month's max
  const effectiveDay = day && Number(day) > daysInMonth ? "" : day;

  const isComplete = month !== "" && effectiveDay !== "" && year !== "";

  const syncDate = (m: string, d: string, y: string) => {
    if (m !== "" && d !== "" && y !== "") {
      const date = new Date(Number(y), Number(m), Number(d));
      if (date <= new Date()) {
        updateUserData("dateOfBirth", date);
      }
    }
  };

  const handleContinue = () => {
    if (isComplete) {
      syncDate(month, effectiveDay, year);
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-dvh px-6 py-8"
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
          className="grid grid-cols-3 gap-3"
        >
          {/* Month */}
          <Select
            value={month}
            onValueChange={(v) => {
              setMonth(v);
              syncDate(v, effectiveDay, year);
            }}
          >
            <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-card text-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Day */}
          <Select
            value={effectiveDay}
            onValueChange={(v) => {
              setDay(v);
              syncDate(month, v, year);
            }}
          >
            <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-card text-sm">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {days.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select
            value={year}
            onValueChange={(v) => {
              setYear(v);
              syncDate(month, effectiveDay, v);
            }}
          >
            <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-card text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {isComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            {MONTHS[Number(month)]} {effectiveDay}, {year}
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
          disabled={!isComplete}
        >
          Continue
        </SpiritualButton>
      </motion.div>
    </motion.div>
  );
};

export default DateOfBirthStep;
