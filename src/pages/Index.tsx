import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import UserDashboard from "@/components/dashboard/UserDashboard";
import JotshiDashboard from "@/components/jotshi/JotshiDashboard";

const Index = () => {
  const { isComplete, userData } = useOnboardingStore();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, don't render (redirect will happen)
  if (!user) {
    return null;
  }

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
