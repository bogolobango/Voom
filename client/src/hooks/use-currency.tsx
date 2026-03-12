import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyType } from '@/lib/utils';

type CurrencyContextType = {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
};

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Safe localStorage getter
const getStoredCurrency = (): CurrencyType => {
  if (typeof window === 'undefined') return 'FCFA';
  try {
    const stored = localStorage.getItem('preferredCurrency');
    if (stored === 'FCFA' || stored === 'GHS' || stored === 'USD') {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  return 'FCFA';
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyType>('FCFA');
  
  // Load from localStorage on mount
  useEffect(() => {
    setCurrency(getStoredCurrency());
  }, []);

  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem('preferredCurrency', newCurrency);
    } catch (e) {
      // localStorage not available
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleCurrencyChange,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
