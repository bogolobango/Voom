import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CurrencyType } from '@/lib/utils';

type CurrencyContextType = {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
};

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Use local storage to persist currency preference if available
  const storedCurrency = localStorage.getItem('preferredCurrency') as CurrencyType | null;
  const [currency, setCurrency] = useState<CurrencyType>(storedCurrency || 'FCFA');

  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
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