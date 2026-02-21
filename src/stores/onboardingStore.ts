import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PartnerDetails {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
}

export interface UserData {
  fullName: string;
  gender: 'male' | 'female' | 'other' | '';
  dateOfBirth: Date | null;
  timeOfBirth: string;
  placeOfBirth: string;
  purpose: string;
  role: 'user' | 'jotshi';
  birthTimeExactness: 'exact' | 'approximate' | 'unknown' | '';
  majorConcern: string;
  relationshipStatus: 'single' | 'dating' | 'engaged' | 'married' | 'separated' | '';
  partnerDetails: PartnerDetails | null;
}

interface OnboardingStore {
  currentStep: number;
  userData: UserData;
  isComplete: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateUserData: <K extends keyof UserData>(key: K, value: UserData[K]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialUserData: UserData = {
  fullName: '',
  gender: '',
  dateOfBirth: null,
  timeOfBirth: '',
  placeOfBirth: '',
  purpose: '',
  role: 'user',
  birthTimeExactness: '',
  majorConcern: '',
  relationshipStatus: '',
  partnerDetails: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      userData: { ...initialUserData },
      isComplete: false,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      updateUserData: (key, value) =>
        set((state) => ({
          userData: { ...state.userData, [key]: value },
        })),
      completeOnboarding: () => set({ isComplete: true }),
      resetOnboarding: () =>
        set({
          currentStep: 0,
          userData: { ...initialUserData },
          isComplete: false,
        }),
    }),
    {
      name: 'stellar-onboarding',
    }
  )
);
