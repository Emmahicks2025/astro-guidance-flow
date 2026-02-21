import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserProfile } from "@/lib/profileService";
import { supabase } from "@/integrations/supabase/client";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AstrologerDashboard from "@/components/jotshi/AstrologerDashboard";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const { isComplete, userData, updateUserData, completeOnboarding } = useOnboardingStore();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splash_shown'));

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splash_shown', '1');
  }, []);

  // Redirect to auth if not logged in, or to admin if admin
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    // Check if user is admin — redirect to admin panel
    const checkAdmin = async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (data === true) {
        navigate('/admin');
      }
    };
    checkAdmin();
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
        // Check if user is admin — skip user flow
        const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        if (isAdmin === true) {
          setCheckingProfile(false);
          return;
        }

        // Check if user is a registered astrologer/jotshi provider
        const { data: jotshiProfiles } = await supabase
          .from('jotshi_profiles')
          .select('id, approval_status')
          .eq('user_id', user.id)
          .limit(1);

        const jotshiProfile = jotshiProfiles?.[0] ?? null;

        if (jotshiProfile) {
          // Astrologer user — redirect to their dashboard
          navigate('/astrologer');
          return;
        }

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

  // Show splash on first load of session
  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen onComplete={handleSplashComplete} />
      </AnimatePresence>
    );
  }

  // Show loading while checking auth or profile
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
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
    return <AstrologerDashboard />;
  }

  return <UserDashboard />;
};

export default Index;
