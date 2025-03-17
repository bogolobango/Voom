import { createContext, ReactNode, useContext, useState } from "react";

type HostModeContextType = {
  isHostMode: boolean;
  toggleHostMode: () => void;
  setHostMode: (isHost: boolean) => void;
};

export const HostModeContext = createContext<HostModeContextType | null>(null);

export function HostModeProvider({ children }: { children: ReactNode }) {
  const [isHostMode, setIsHostMode] = useState(false);

  const toggleHostMode = () => {
    setIsHostMode((prev) => !prev);
  };

  const setHostMode = (isHost: boolean) => {
    setIsHostMode(isHost);
  };

  return (
    <HostModeContext.Provider
      value={{
        isHostMode,
        toggleHostMode,
        setHostMode,
      }}
    >
      {children}
    </HostModeContext.Provider>
  );
}

export function useHostMode() {
  const context = useContext(HostModeContext);
  if (!context) {
    throw new Error("useHostMode must be used within a HostModeProvider");
  }
  return context;
}