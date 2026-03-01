import { Briefcase, Construction } from "lucide-react";

export default function Negocios() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold tracking-tight flex items-center justify-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Negócios
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Esta funcionalidade está em desenvolvimento e estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
