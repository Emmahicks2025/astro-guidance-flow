import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/stores/onboardingStore';

export const saveUserProfile = async (userId: string, userData: UserData) => {
  const profileData = {
    user_id: userId,
    role: userData.role,
    full_name: userData.fullName || null,
    gender: userData.gender || null,
    date_of_birth: userData.dateOfBirth ? userData.dateOfBirth.toISOString().split('T')[0] : null,
    time_of_birth: userData.timeOfBirth || null,
    place_of_birth: userData.placeOfBirth || null,
    birth_time_exactness: userData.birthTimeExactness || null,
    major_concern: userData.majorConcern || null,
    relationship_status: userData.relationshipStatus || null,
    partner_name: userData.partnerDetails?.name || null,
    partner_dob: userData.partnerDetails?.dateOfBirth || null,
    partner_time_of_birth: userData.partnerDetails?.timeOfBirth || null,
    partner_place_of_birth: userData.partnerDetails?.placeOfBirth || null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving profile:', error);
    throw error;
  }

  return data;
};

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
};

export const saveJotshiProfile = async (userId: string, jotshiData: {
  specialty?: string;
  experience_years?: number;
  hourly_rate?: number;
  bio?: string;
}) => {
  const { data, error } = await supabase
    .from('jotshi_profiles')
    .upsert({
      user_id: userId,
      ...jotshiData
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving jotshi profile:', error);
    throw error;
  }

  return data;
};

export const fetchOnlineJotshis = async () => {
  const { data, error } = await supabase
    .from('jotshi_profiles')
    .select('*')
    .eq('is_online', true)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching jotshis:', error);
    throw error;
  }

  return data;
};
