import { Outlet } from "react-router-dom";
import { CrmSidebar } from "@/components/CrmSidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      <CrmSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
