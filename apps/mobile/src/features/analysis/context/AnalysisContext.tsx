import React, { createContext, useContext, useState, JSX } from 'react';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';

export type { NeighborhoodEntity, POIEntity };

export interface AnalyzeLocationOutput {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
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
  const [analysisResult, setAnalysisResult] = useState<AnalyzeLocationOutput | null>(null);

  const reset = () => {
    setAnalysisResult(null);
  };

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