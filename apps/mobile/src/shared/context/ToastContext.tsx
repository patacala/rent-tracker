import { ToastContainer } from '@shared/components/Toast/ToastContainer';
import React, { createContext, useContext, useState, useCallback, JSX } from 'react';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  /** When true the toast shows a spinner and does not auto-dismiss */
  loading?: boolean;
}

interface ToastContextValue {
  show: (type: ToastType, message: string, duration?: number) => string;
  /** Manually remove a toast by id (use with loading toasts) */
  dismiss: (id: string) => void;
  /** Show a persistent info toast with a spinner. Returns the id so you can dismiss it later. */
  loading: (message: string) => string;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, message: string, duration = 3000): string => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadingToast = useCallback((msg: string): string => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type: 'info', message: msg, loading: true }]);
    return id;
  }, []);

  const success = useCallback((msg: string, duration?: number) => show('success', msg, duration), [show]);
  const error = useCallback((msg: string, duration?: number) => show('error', msg, duration), [show]);
  const info = useCallback((msg: string, duration?: number) => show('info', msg, duration), [show]);
  const warning = useCallback((msg: string, duration?: number) => show('warning', msg, duration), [show]);

  return (
    <ToastContext.Provider value={{ show, dismiss, loading: loadingToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}