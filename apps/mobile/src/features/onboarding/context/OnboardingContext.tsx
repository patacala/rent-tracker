import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingProfile } from '../store/onboardingApi';

type ChildAgeGroup = '0-5' | '6-12' | '13-18';
type LifestylePreference = 'suburban' | 'urban';
type CommuteOption = 15 | 30 | 45 | 60;
type YesOrNot = 'yes' | 'no';

export interface OnboardingData {
  workAddress: string;
  workCoordinates: { latitude: number; longitude: number } | null;
  commute: CommuteOption;
  priorities: string[];
  hasChildren: YesOrNot;
  childAgeGroups: ChildAgeGroup[];
  hasPets: YesOrNot;
  lifestyle: LifestylePreference | null;
}

interface OnboardingContextValue {
  data: OnboardingData;
  currentStep: number;
  isLoading: boolean;
  setStep1: (values: Pick<OnboardingData, 'workAddress' | 'commute' | 'workCoordinates'>) => Promise<void>;
  setStep2: (values: Pick<OnboardingData, 'priorities'>) => Promise<void>;
  setStep3: (values: Pick<OnboardingData, 'hasChildren' | 'childAgeGroups' | 'hasPets' | 'lifestyle'>) => Promise<void>;
  setCurrentStep: (step: number) => Promise<void>;
  reset: () => Promise<void>;
  clearData: () => Promise<void>;
  hydrateFromServer: (profile: OnboardingProfile) => Promise<void>;
}

const STORAGE_KEY = '@onboarding:data';
const STEP_KEY = '@onboarding:step';

const DEFAULT: OnboardingData = {
  workAddress: '',
  workCoordinates: null,
  commute: 30,
  priorities: [],
  hasChildren: 'no',
  childAgeGroups: [],
  hasPets: 'no',
  lifestyle: null,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [data, setData] = useState<OnboardingData>(DEFAULT);
  const [currentStep, setCurrentStepState] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stored, step] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(STEP_KEY),
        ]);
        if (stored) setData(JSON.parse(stored));
        if (step) setCurrentStepState(Number(step));
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const save = async (updated: OnboardingData) => {
    setData(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const setCurrentStep = async (step: number) => {
    setCurrentStepState(step);
    await AsyncStorage.setItem(STEP_KEY, String(step));
  };

  const setStep1: OnboardingContextValue['setStep1'] = async (values) => {
    await save({ ...data, ...values });
  };

  const setStep2: OnboardingContextValue['setStep2'] = async (values) => {
    await save({ ...data, ...values });
  };

  const setStep3: OnboardingContextValue['setStep3'] = async (values) => {
    await save({ ...data, ...values });
  };

  const reset = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, STEP_KEY]);
    setData(DEFAULT);
    setCurrentStepState(0);
  };

  const clearData = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, STEP_KEY]);
    setData(DEFAULT);
    setCurrentStepState(0);
  };

  const toCommuteOption = (value: number | string | undefined): CommuteOption => {
    const num = Number(value);
    const validOptions: CommuteOption[] = [15, 30, 45, 60];

    if (!isNaN(num) && validOptions.includes(num as CommuteOption)) {
      return num as CommuteOption;
    }
    return 30;
  };

  const toYesOrNo = (value: string | undefined) => {
    if (value === 'yes' || value === 'no') {
      return value;
    }
    return 'no';
  };

  const toChildAgeGroups = (value: unknown): ChildAgeGroup[] => {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is ChildAgeGroup => 
      v === '0-5' || v === '6-12' || v === '13-18'
    );
  };

  const toLifestyle = (value: string | null | undefined): LifestylePreference | null => {
    if (value === 'suburban' || value === 'urban') {
      return value;
    }
    return null;
  };

  const hydrateFromServer = async (profile: OnboardingProfile) => {
    const mapped: OnboardingData = {
      workAddress: profile.workAddress ?? '',
      workCoordinates: null,
      commute: toCommuteOption(profile.commute),
      priorities: Array.isArray(profile.priorities) ? profile.priorities : [],
      hasChildren: toYesOrNo(profile.hasChildren),
      childAgeGroups: toChildAgeGroups(profile.childAgeGroups),
      hasPets: toYesOrNo(profile.hasPets),
      lifestyle: toLifestyle(profile.lifestyle),
    };

    await save(mapped);
  };

  return (
    <OnboardingContext.Provider value={{
      data,
      currentStep,
      isLoading,
      setStep1,
      setStep2,
      setStep3,
      setCurrentStep,
      reset,
      clearData,
      hydrateFromServer,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}