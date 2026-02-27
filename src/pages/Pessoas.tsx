import { useState } from "react";
import { mockPessoas } from "@/lib/mock-data";
import { Pessoa } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const tipoLabels: Record<Pessoa["tipo"], string> = {
  autor: "Autor",
  reu: "Réu",
  advogado: "Advogado",
  terceiro: "Terceiro",
};

export default function Pessoas() {
  const [search, setSearch] = useState("");
  const pessoas = mockPessoas.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.cpfCnpj.includes(q) || (p.email?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Pessoas</h1>
          <p className="text-sm text-muted-foreground mt-1">Cadastro de partes, autores e envolvidos nos processos</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nova Pessoa</Button>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CPF/CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pessoas.map(p => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="font-mono text-xs">{p.cpfCnpj}</TableCell>
                  <TableCell className="text-xs">{p.email ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.telefone ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.cidade && p.uf ? `${p.cidade}/${p.uf}` : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{tipoLabels[p.tipo]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
