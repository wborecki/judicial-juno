import {
  LayoutDashboard, Scale, Filter, ArrowRightLeft, FileSearch, DollarSign,
  Phone, Briefcase, Users, Building2, UserCog, MessageSquare, Settings, LogOut
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MegaTecLogo } from "./MegaTecLogo";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
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
  { to: "/pessoas", label: "Pessoas", icon: Users },
  { to: "/equipes", label: "Equipes", icon: Building2 },
  { to: "/usuarios", label: "Usuários", icon: UserCog },
];

function SidebarSection({ title, items }: { title: string; items: NavItem[] }) {
  const location = useLocation();

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 py-2 font-semibold">
        {title}
      </p>
      {items.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isActive
                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                  : "bg-sidebar-foreground/10 text-sidebar-foreground/50"
              )}>
                {item.badge}
              </span>
            )}
          </RouterNavLink>
        );
      })}
    </div>
  );
}

export function CrmSidebar() {
  const { user, signOut } = useAuth();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";
  const displayName = user?.user_metadata?.full_name || user?.email || "Usuário";

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <MegaTecLogo size="md" />
        <p className="text-[10px] text-sidebar-foreground/40 mt-1.5">Gestão de Ativos Judiciais</p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <SidebarSection title="Processos" items={analiseItems} />
        <SidebarSection title="Comercial" items={comercialItems} />
        <SidebarSection title="Sistema" items={sistemaItems} />
      </nav>

      <div className="p-4 border-t border-sidebar-border">
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
      </div>
    </aside>
  );
}
