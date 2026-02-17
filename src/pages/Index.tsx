import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserProfile } from "@/lib/profileService";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import UserDashboard from "@/components/dashboard/UserDashboard";
import JotshiDashboard from "@/components/jotshi/JotshiDashboard";

const Index = () => {
  const { isComplete, userData, updateUserData, completeOnboarding } = useOnboardingStore();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load saved profile from DB on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      // Already completed in this session
      if (isComplete) {
        setCheckingProfile(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(user.id);
        
        // If profile exists and has a name (meaning onboarding was completed before)
        if (profile && profile.full_name) {
          // Restore user data from saved profile
          updateUserData('fullName', profile.full_name || '');
          updateUserData('gender', (profile.gender as any) || '');
          updateUserData('role', profile.role === 'jotshi' ? 'jotshi' : 'user');
          updateUserData('placeOfBirth', profile.place_of_birth || '');
          updateUserData('timeOfBirth', profile.time_of_birth || '');
          updateUserData('birthTimeExactness', (profile.birth_time_exactness as any) || '');
          updateUserData('majorConcern', profile.major_concern || '');
          updateUserData('relationshipStatus', (profile.relationship_status as any) || '');
          
          if (profile.date_of_birth) {
            updateUserData('dateOfBirth', new Date(profile.date_of_birth));
          }

          if (profile.partner_name) {
            updateUserData('partnerDetails', {
              name: profile.partner_name,
              dateOfBirth: profile.partner_dob || '',
              timeOfBirth: profile.partner_time_of_birth || '',
              placeOfBirth: profile.partner_place_of_birth || '',
            });
          }

          // Mark onboarding as complete since profile already exists
          completeOnboarding();
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (!loading) {
      loadProfile();
    }
  }, [user, loading]);

  // Show loading while checking auth or profile
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isComplete) {
    return <OnboardingFlow />;
  }

  if (userData.role === 'jotshi') {
    return <JotshiDashboard />;
  }

  return <UserDashboard />;
};

export default Index;
