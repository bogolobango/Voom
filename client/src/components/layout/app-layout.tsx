import { ReactNode } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { HostBottomNav } from "./host-bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideNavigation?: boolean;
}

export function AppLayout({
  children,
  title,
  showBack,
  onBack,
  hideNavigation = false,
}: AppLayoutProps) {
  const { user } = useAuth();
  const { isHostMode } = useHostMode();

  const showHostInterface = user?.isHost && isHostMode;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title={title} showBack={showBack} onBack={onBack} />
      
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      {!hideNavigation && (
        <>
          {showHostInterface ? (
            <HostBottomNav />
          ) : (
            <BottomNav />
          )}
        </>
      )}
    </div>
  );
}