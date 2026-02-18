import React, { createContext, useContext, useState, JSX } from 'react';

type ChildAgeGroup = '0-5' | '6-12' | '13-18';
type LifestylePreference = 'suburban' | 'urban';
type CommuteOption = 15 | 30 | 45;

export interface OnboardingData {
  workAddress: string;
  commute: CommuteOption;
  priorities: string[];
  hasChildren: 'yes' | 'no';
  childAgeGroups: ChildAgeGroup[];
  hasPets: 'yes' | 'no';
  lifestyle: LifestylePreference | null;
}

interface OnboardingContextValue {
  data: OnboardingData;
  setStep1: (values: Pick<OnboardingData, 'workAddress' | 'commute'>) => void;
  setStep2: (values: Pick<OnboardingData, 'priorities'>) => void;
  setStep3: (values: Pick<OnboardingData, 'hasChildren' | 'childAgeGroups' | 'hasPets' | 'lifestyle'>) => void;
  reset: () => void;
}

const DEFAULT: OnboardingData = {
  workAddress: '',
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

  const setStep1: OnboardingContextValue['setStep1'] = (values) =>
    setData((prev) => ({ ...prev, ...values }));

  const setStep2: OnboardingContextValue['setStep2'] = (values) =>
    setData((prev) => ({ ...prev, ...values }));

  const setStep3: OnboardingContextValue['setStep3'] = (values) =>
    setData((prev) => ({ ...prev, ...values }));

  const reset = () => setData(DEFAULT);

  return (
    <OnboardingContext.Provider value={{ data, setStep1, setStep2, setStep3, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}