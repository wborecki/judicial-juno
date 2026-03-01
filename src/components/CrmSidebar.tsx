import {
  LayoutDashboard, Scale, Briefcase, MessageSquare, Settings, LogOut, PanelLeftClose, PanelLeft
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MegaTecLogo } from "./MegaTecLogo";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const analiseItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/processos", label: "Processos", icon: Scale },
];

const comercialItems: NavItem[] = [
  { to: "/negocios", label: "Negócios", icon: Briefcase },
];

const sistemaItems: NavItem[] = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

function SidebarSection({ title, items, collapsed }: { title: string; items: NavItem[]; collapsed: boolean }) {
  const location = useLocation();

  return (
    <div>
      {!collapsed && (
        <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 py-2 font-semibold">
          {title}
        </p>
      )}
      {collapsed && <div className="h-px bg-sidebar-border mx-2 my-2" />}
      {items.map((item) => {
        const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
        const link = (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={cn(
              "w-full flex items-center rounded-lg transition-all duration-200",
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
          </RouterNavLink>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.to} delayDuration={0}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
            </Tooltip>
          );
        }
        return link;
      })}
    </div>
  );
}

export function CrmSidebar() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";
  const displayName = user?.user_metadata?.full_name || user?.email || "Usuário";

  return (
    <aside className={cn(
      "min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 transition-all duration-300",
      collapsed ? "w-14" : "w-64"
    )}>
      {/* Header */}
      <div className={cn("border-b border-sidebar-border flex items-center", collapsed ? "p-2 justify-center" : "p-6 justify-between")}>
        {!collapsed && (
          <div>
            <MegaTecLogo size="md" />
            <p className="text-[10px] text-sidebar-foreground/40 mt-1.5">Gestão de Ativos Judiciais</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SidebarSection title="Processos" items={analiseItems} collapsed={collapsed} />
        <SidebarSection title="Comercial" items={comercialItems} collapsed={collapsed} />
        <SidebarSection title="Sistema" items={sistemaItems} collapsed={collapsed} />
      </nav>

      {/* User */}
      <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="w-full flex justify-center p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-semibold text-[10px]">
                  {initials}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">{displayName} · Sair</TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-semibold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
