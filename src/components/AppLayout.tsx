import { Outlet, useLocation } from "react-router-dom";
import { CrmSidebar } from "@/components/CrmSidebar";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";

const SELF_SCROLL_ROUTES = ["/configuracoes", "/chat", "/processos", "/analise", "/distribuicao", "/negocios"];

export function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  const isSelfScroll = SELF_SCROLL_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );
  const isFullWidth = isSelfScroll;

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      <CrmSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className={cn("flex-1", isSelfScroll ? "overflow-hidden" : "overflow-y-auto")}>
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
