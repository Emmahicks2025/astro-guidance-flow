import { useOnboardingStore } from "@/stores/onboardingStore";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import UserDashboard from "@/components/dashboard/UserDashboard";
import JotshiDashboard from "@/components/jotshi/JotshiDashboard";

const Index = () => {
  const { isComplete, userData } = useOnboardingStore();

  // Show onboarding if not complete
  if (!isComplete) {
    return <OnboardingFlow />;
  }

  // Show appropriate dashboard based on role
  if (userData.role === 'jotshi') {
    return <JotshiDashboard />;
  }

  return <UserDashboard />;
};

export default Index;
