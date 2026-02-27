import { Outlet } from "react-router-dom";
import { CrmSidebar } from "@/components/CrmSidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background w-full">
      <CrmSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
