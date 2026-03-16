import { Outlet, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, Building2, UserCog, Settings, Briefcase, Bell, Plug, GitBranchPlus, Route, ListChecks, FileText } from "lucide-react";

const settingsNav = [
  { label: "Geral", to: "/configuracoes", icon: Settings, end: true },
  { label: "Pessoas", to: "/configuracoes/pessoas", icon: Users },
  { label: "Equipes", to: "/configuracoes/equipes", icon: Building2 },
  { label: "Usuários", to: "/configuracoes/usuarios", icon: UserCog },
  { label: "Campos Personalizados", to: "/configuracoes/campos-analise", icon: Briefcase },
  { label: "Tipos de Atividade", to: "/configuracoes/tipos-atividade", icon: ListChecks },
  { label: "Pipelines", to: "/configuracoes/pipelines", icon: GitBranchPlus },
  { label: "Roteamento", to: "/configuracoes/roteamento", icon: Route },
  { label: "Notificações", to: "/configuracoes/notificacoes", icon: Bell },
  { label: "Integrações", to: "/configuracoes/integracoes", icon: Plug },
];

export default function ConfiguracoesLayout() {
  const location = useLocation();

  return (
    <div className="flex h-full">
      {/* Inner sidebar */}
      <aside className="w-52 shrink-0 border-r border-border bg-muted/20 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2 font-semibold">
          Configurações
        </p>
        {settingsNav.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-background text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[900px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
