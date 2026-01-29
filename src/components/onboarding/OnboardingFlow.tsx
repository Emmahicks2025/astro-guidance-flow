import { AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboardingStore";
import WelcomeStep from "./WelcomeStep";
import NameStep from "./NameStep";
import GenderStep from "./GenderStep";
import DateOfBirthStep from "./DateOfBirthStep";
import TimeOfBirthStep from "./TimeOfBirthStep";
import PlaceOfBirthStep from "./PlaceOfBirthStep";
import PurposeStep from "./PurposeStep";
import JotshiLogin from "../jotshi/JotshiLogin";

const OnboardingFlow = () => {
  const { currentStep, userData } = useOnboardingStore();

  // Different flows based on role
  const userSteps = [
    <WelcomeStep key="welcome" />,
    <NameStep key="name" />,
    <GenderStep key="gender" />,
    <DateOfBirthStep key="dob" />,
    <TimeOfBirthStep key="time" />,
    <PlaceOfBirthStep key="place" />,
    <PurposeStep key="purpose" />,
  ];

  const jotshiSteps = [
    <WelcomeStep key="welcome" />,
    <JotshiLogin key="jotshi-login" />,
  ];

  const steps = userData.role === 'jotshi' ? jotshiSteps : userSteps;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <AnimatePresence mode="wait">
        {steps[currentStep]}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
