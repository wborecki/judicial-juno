import { useState, useMemo } from "react";
import { useAgendaEventos, type AgendaEvento } from "@/hooks/useAgendaEventos";
import { useUsuarios } from "@/hooks/useEquipes";
import { EventoSheet } from "@/components/agenda/EventoSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, List, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Scale, Briefcase } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, addWeeks, isSameDay, isSameMonth, isToday, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ViewMode = "mensal" | "semanal" | "lista";

const TIPO_LABELS: Record<string, string> = {
  tarefa: "Tarefa",
  reuniao: "Reunião",
  audiencia: "Audiência",
  prazo: "Prazo",
};

const TIPO_ICONS: Record<string, React.ElementType> = {
  tarefa: Clock,
  reuniao: User,
  audiencia: Scale,
  prazo: Briefcase,
};

const PRIORIDADE_COLORS: Record<string, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-info/10 text-info border-info/20",
  alta: "bg-warning/10 text-warning border-warning/20",
  urgente: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-warning/10 text-warning",
  concluido: "bg-success/10 text-success",
  cancelado: "bg-muted text-muted-foreground line-through",
};

export default function Agenda() {
  const [view, setView] = useState<ViewMode>("mensal");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<AgendaEvento | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterResponsavel, setFilterResponsavel] = useState("all");

  // Calculate date range for query
  const dateRange = useMemo(() => {
    if (view === "mensal") {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return {
        start: startOfWeek(ms, { weekStartsOn: 0 }).toISOString(),
        end: endOfWeek(me, { weekStartsOn: 0 }).toISOString(),
      };
    } else if (view === "semanal") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
      const we = endOfWeek(currentDate, { weekStartsOn: 0 });
      return { start: ws.toISOString(), end: we.toISOString() };
    }
    // lista: fetch next 60 days
    return { start: new Date().toISOString(), end: addDays(new Date(), 60).toISOString() };
  }, [view, currentDate]);

  const { data: eventos, isLoading } = useAgendaEventos(dateRange.start, dateRange.end);
  const { data: usuarios } = useUsuarios();

  const filtered = useMemo(() => {
    return (eventos ?? []).filter((e) => {
      if (filterTipo !== "all" && e.tipo !== filterTipo) return false;
      if (filterResponsavel !== "all" && e.responsavel_id !== filterResponsavel) return false;
      return true;
    });
  }, [eventos, filterTipo, filterResponsavel]);

  const navigate = (dir: number) => {
    if (view === "mensal") setCurrentDate((d) => addMonths(d, dir));
    else if (view === "semanal") setCurrentDate((d) => addWeeks(d, dir));
  };

  const openNew = (date?: Date) => {
    setSelectedEvento(null);
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const openEdit = (ev: AgendaEvento) => {
    setSelectedEvento(ev);
    setSheetOpen(true);
  };

  const getUsuarioNome = (id: string | null) => (usuarios ?? []).find((u) => u.id === id)?.nome ?? "";

  const headerLabel = useMemo(() => {
    if (view === "mensal") return format(currentDate, "MMMM yyyy", { locale: ptBR });
    if (view === "semanal") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
      const we = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(ws, "dd MMM", { locale: ptBR })} — ${format(we, "dd MMM yyyy", { locale: ptBR })}`;
    }
    return "Próximos compromissos";
  }, [view, currentDate]);

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-4">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Agenda
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} evento(s)</p>
        </div>
        <Button onClick={() => openNew()} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Evento
        </Button>
      </div>

      {/* Controls */}
      <div className="shrink-0 flex items-center gap-2 flex-wrap">
        {/* View toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          {(["mensal", "semanal", "lista"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                view === v ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Navigation */}
        {view !== "lista" && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium ml-2 capitalize">{headerLabel}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Filters */}
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="h-8 text-xs w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos tipos</SelectItem>
            {Object.entries(TIPO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
          <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue placeholder="Responsável" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(usuarios ?? []).filter((u) => u.ativo).map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <Skeleton className="flex-1" />
      ) : (
        <div className="flex-1 min-h-0 overflow-auto">
          {view === "mensal" && <MonthView currentDate={currentDate} eventos={filtered} onDayClick={openNew} onEventClick={openEdit} />}
          {view === "semanal" && <WeekView currentDate={currentDate} eventos={filtered} onSlotClick={openNew} onEventClick={openEdit} />}
          {view === "lista" && <ListView eventos={filtered} onEventClick={openEdit} getUsuarioNome={getUsuarioNome} />}
        </div>
      )}

      <EventoSheet open={sheetOpen} onOpenChange={setSheetOpen} evento={selectedEvento} defaultDate={selectedDate} />
    </div>
  );
}

// ─── Month View ──────────────────────────────────────────
function MonthView({ currentDate, eventos, onDayClick, onEventClick }: {
  currentDate: Date;
  eventos: AgendaEvento[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: AgendaEvento) => void;
}) {
  const ms = startOfMonth(currentDate);
  const me = endOfMonth(currentDate);
  const calStart = startOfWeek(ms, { weekStartsOn: 0 });
  const calEnd = endOfWeek(me, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getEventsForDay = (day: Date) =>
    eventos.filter((e) => isSameDay(new Date(e.data_inicio), day));

  return (
    <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          return (
            <div
              key={i}
              className={cn(
                "border-b border-r p-1 min-h-[80px] cursor-pointer hover:bg-muted/20 transition-colors",
                !inMonth && "opacity-40 bg-muted/10"
              )}
              onClick={() => onDayClick(day)}
            >
              <div className={cn(
                "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                today && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    className="w-full text-left text-[10px] px-1 py-0.5 rounded truncate font-medium"
                    style={{ backgroundColor: (ev.cor ?? "#3b82f6") + "20", color: ev.cor ?? "#3b82f6" }}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  >
                    {ev.titulo}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 3} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ──────────────────────────────────────────
function WeekView({ currentDate, eventos, onSlotClick, onEventClick }: {
  currentDate: Date;
  eventos: AgendaEvento[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: AgendaEvento) => void;
}) {
  const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: ws, end: addDays(ws, 6) });
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

  const getEventsForDayHour = (day: Date, hour: number) =>
    eventos.filter((e) => {
      const d = new Date(e.data_inicio);
      return isSameDay(d, day) && d.getHours() === hour;
    });

  return (
    <div className="glass-card rounded-xl overflow-auto h-full">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]">
        {/* Header */}
        <div className="border-b bg-muted/30" />
        {days.map((d, i) => (
          <div key={i} className={cn(
            "text-center border-b border-l bg-muted/30 py-2",
            isToday(d) && "bg-primary/5"
          )}>
            <div className="text-[10px] text-muted-foreground uppercase">{format(d, "EEE", { locale: ptBR })}</div>
            <div className={cn(
              "text-sm font-semibold w-7 h-7 mx-auto flex items-center justify-center rounded-full",
              isToday(d) && "bg-primary text-primary-foreground"
            )}>
              {format(d, "d")}
            </div>
          </div>
        ))}

        {/* Time grid */}
        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-b h-16">
              {`${hour.toString().padStart(2, "0")}:00`}
            </div>
            {days.map((day, di) => {
              const evs = getEventsForDayHour(day, hour);
              return (
                <div
                  key={di}
                  className={cn(
                    "border-b border-l h-16 p-0.5 cursor-pointer hover:bg-muted/20 transition-colors relative",
                    isToday(day) && "bg-primary/[0.02]"
                  )}
                  onClick={() => {
                    const d = new Date(day);
                    d.setHours(hour, 0, 0, 0);
                    onSlotClick(d);
                  }}
                >
                  {evs.map((ev) => (
                    <button
                      key={ev.id}
                      className="w-full text-left text-[10px] px-1.5 py-1 rounded truncate font-medium mb-0.5"
                      style={{ backgroundColor: (ev.cor ?? "#3b82f6") + "20", color: ev.cor ?? "#3b82f6" }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    >
                      {ev.titulo}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── List View ──────────────────────────────────────────
function ListView({ eventos, onEventClick, getUsuarioNome }: {
  eventos: AgendaEvento[];
  onEventClick: (e: AgendaEvento) => void;
  getUsuarioNome: (id: string | null) => string;
}) {
  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, AgendaEvento[]>();
    eventos.forEach((e) => {
      const key = format(new Date(e.data_inicio), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [eventos]);

  if (grouped.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Nenhum compromisso nos próximos 60 dias.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([dateKey, evs]) => (
        <div key={dateKey}>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "text-xs font-semibold px-2 py-1 rounded",
              isToday(new Date(dateKey + "T12:00:00")) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {format(new Date(dateKey + "T12:00:00"), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
          <div className="space-y-1.5">
            {evs.map((ev) => {
              const Icon = TIPO_ICONS[ev.tipo] ?? Clock;
              return (
                <div
                  key={ev.id}
                  className="glass-card rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onEventClick(ev)}
                >
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: ev.cor ?? "#3b82f6" }} />
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", ev.status === "cancelado" && "line-through text-muted-foreground")}>
                      {ev.titulo}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ev.dia_inteiro ? "Dia inteiro" : format(new Date(ev.data_inicio), "HH:mm")}
                        {ev.data_fim && !ev.dia_inteiro && ` — ${format(new Date(ev.data_fim), "HH:mm")}`}
                      </span>
                      {ev.local && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{ev.local}
                        </span>
                      )}
                      {ev.responsavel_id && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />{getUsuarioNome(ev.responsavel_id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className={cn("text-[10px] shrink-0", PRIORIDADE_COLORS[ev.prioridade])}>
                    {ev.prioridade}
                  </Badge>
                  <Badge variant="secondary" className={cn("text-[10px] shrink-0", STATUS_COLORS[ev.status])}>
                    {ev.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
