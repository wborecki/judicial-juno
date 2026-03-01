import { Outlet, useLocation } from "react-router-dom";
import { CrmSidebar } from "@/components/CrmSidebar";
import { AppHeader } from "@/components/AppHeader";

export function AppLayout() {
  const location = useLocation();
  const isFullWidth = location.pathname.startsWith("/configuracoes") || location.pathname === "/chat";

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      <CrmSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          {isFullWidth ? (
            <Outlet />
          ) : (
            <div className="max-w-[1200px] mx-auto p-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
