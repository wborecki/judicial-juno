import { Outlet, useLocation } from "react-router-dom";
import { CrmSidebar } from "@/components/CrmSidebar";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";

const COMPACT_ROUTES = new Set(["/", "/triagem", "/precificacao", "/comercial"]);

const getTopLevelRoute = (pathname: string) => {
  const [segment] = pathname.split("/").filter(Boolean);
  return segment ? `/${segment}` : "/";
};

export function AppLayout() {
  const location = useLocation();
  const topLevelRoute = getTopLevelRoute(location.pathname);

  const isCompactRoute = COMPACT_ROUTES.has(topLevelRoute);
  const isSelfScroll = !isCompactRoute;
  const isFullWidth = !isCompactRoute;

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
