'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AutoRefreshContextType {
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  refreshInterval: number;
}

const AutoRefreshContext = createContext<AutoRefreshContextType>({
  autoRefresh: true,
  setAutoRefresh: () => {},
  refreshInterval: 10000,
});

export const useAutoRefresh = () => useContext(AutoRefreshContext);

interface AutoRefreshProviderProps {
  children: ReactNode;
}

export function AutoRefreshProvider({ children }: AutoRefreshProviderProps) {
  // Load preference from localStorage, default to true
  const [autoRefresh, setAutoRefreshState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('autoRefresh');
      return stored !== 'false'; // Default true unless explicitly set to false
    }
    return true;
  });

  // Refresh interval in milliseconds (10 seconds when enabled)
  const refreshInterval = autoRefresh ? 10000 : 0;

  // Save preference to localStorage whenever it changes
  const setAutoRefresh = (value: boolean) => {
    setAutoRefreshState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoRefresh', String(value));
    }
  };

  return (
    <AutoRefreshContext.Provider value={{ autoRefresh, setAutoRefresh, refreshInterval }}>
      {children}
    </AutoRefreshContext.Provider>
  );
}

export default AutoRefreshContext;
