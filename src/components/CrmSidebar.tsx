import {
  LayoutDashboard, Scale, Briefcase, MessageSquare, Settings, PanelLeftClose, PanelLeft, CalendarDays, Wallet
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MegaTecLogo } from "./MegaTecLogo";
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
  { to: "/carteira", label: "Carteira", icon: Wallet },
];

const sistemaItems: NavItem[] = [
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
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
  const [collapsed, setCollapsed] = useState(false);

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

    </aside>
  );
}
