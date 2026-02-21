import React, { createContext, useContext, useState, JSX } from 'react';

export interface POIEntity {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export interface NeighborhoodEntity {
  id: string;
  name: string;
  score?: number;
  boundary?: any;
}

export interface AnalyzeLocationOutput {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
  }>;
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
