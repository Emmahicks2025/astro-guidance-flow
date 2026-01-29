import { create } from 'zustand';

export interface UserData {
  fullName: string;
  gender: 'male' | 'female' | 'other' | '';
  dateOfBirth: Date | null;
  timeOfBirth: string;
  placeOfBirth: string;
  purpose: string;
  role: 'user' | 'jotshi';
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

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 0,
  userData: {
    fullName: '',
    gender: '',
    dateOfBirth: null,
    timeOfBirth: '',
    placeOfBirth: '',
    purpose: '',
    role: 'user',
  },
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
      userData: {
        fullName: '',
        gender: '',
        dateOfBirth: null,
        timeOfBirth: '',
        placeOfBirth: '',
        purpose: '',
        role: 'user',
      },
      isComplete: false,
    }),
}));
