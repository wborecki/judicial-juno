import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pages = [
  { label: "Dashboard", to: "/" },
  { label: "Processos", to: "/processos" },
  { label: "Negócios", to: "/negocios" },
  { label: "Chat", to: "/chat" },
  { label: "Configurações", to: "/configuracoes" },
  { label: "Pessoas", to: "/configuracoes/pessoas" },
  { label: "Equipes", to: "/configuracoes/equipes" },
  { label: "Usuários", to: "/configuracoes/usuarios" },
  { label: "Campos de Análise", to: "/configuracoes/campos-analise" },
  { label: "Notificações", to: "/configuracoes/notificacoes" },
  { label: "Integrações", to: "/configuracoes/integracoes" },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";
  const displayName = user?.user_metadata?.full_name || user?.email || "Usuário";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
        {/* Search trigger */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 h-9 w-72 rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Pesquisar...</span>
          <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
            <Link to="/configuracoes/notificacoes">
              <Bell className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
            <Link to="/configuracoes">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                <User className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Pesquisar páginas..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {pages.map((p) => (
              <CommandItem
                key={p.to}
                onSelect={() => {
                  navigate(p.to);
                  setOpen(false);
                }}
              >
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
