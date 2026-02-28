import React, { createContext, useContext, useState, useEffect, useCallback, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';

export type { NeighborhoodEntity, POIEntity };

const ANALYSIS_STORAGE_KEY = '@analysis_result';

export interface AnalyzeLocationOutput {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
    isFavorite: boolean;
  }>;
  isochrone?: any;
}

interface AnalysisContextValue {
  analysisResult: AnalyzeLocationOutput | null;
  setAnalysisResult: (result: AnalyzeLocationOutput | null) => void;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [analysisResult, setAnalysisResultState] = useState<AnalyzeLocationOutput | null>(null);

  // Rehidrata desde AsyncStorage al iniciar
  useEffect(() => {
    AsyncStorage.getItem(ANALYSIS_STORAGE_KEY)
      .then((raw) => {
        if (raw) setAnalysisResultState(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  const setAnalysisResult = useCallback((result: AnalyzeLocationOutput | null) => {
    setAnalysisResultState(result);
    if (result) {
      AsyncStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(result)).catch(() => {});
    } else {
      AsyncStorage.removeItem(ANALYSIS_STORAGE_KEY).catch(() => {});
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysisResult(null);
  }, [setAnalysisResult]);

  return (
    <AnalysisContext.Provider value={{ analysisResult, setAnalysisResult, reset }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used inside AnalysisProvider');
  return ctx;
}