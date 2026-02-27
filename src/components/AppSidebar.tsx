import { LayoutDashboard, Filter, CheckCircle2, XCircle, RotateCcw, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: Record<string, number>;
}

const navItems = [
  { id: "todos", label: "Todos os Processos", icon: LayoutDashboard },
  { id: "pendente", label: "Pendentes", icon: Filter },
  { id: "apto", label: "Aptos", icon: CheckCircle2 },
  { id: "descartado", label: "Descartados", icon: XCircle },
  { id: "reanálise", label: "Reanálise", icon: RotateCcw },
];

export function AppSidebar({ activeFilter, onFilterChange, counts }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-display text-xl font-bold tracking-tight">
          <span className="text-sidebar-primary">Juris</span>Flow
        </h1>
        <p className="text-xs text-sidebar-foreground/50 mt-1">Gestão de Processos</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 py-2 font-semibold">
          Triagem
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              activeFilter === item.id
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeFilter === item.id
                ? "bg-sidebar-primary/20 text-sidebar-primary"
                : "bg-sidebar-foreground/10 text-sidebar-foreground/50"
            )}>
              {counts[item.id] ?? 0}
            </span>
          </button>
        ))}

        <div className="pt-6">
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 py-2 font-semibold">
            Sistema
          </p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">
            <Users className="w-4 h-4" />
            <span>Equipes</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-semibold text-xs">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Analista</p>
            <p className="text-[10px] text-sidebar-foreground/50">Equipe de Triagem</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
