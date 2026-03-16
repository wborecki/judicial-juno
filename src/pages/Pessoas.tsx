import { useState } from "react";
import { usePessoas, PessoaDB } from "@/hooks/usePessoas";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PessoaSheet from "@/components/PessoaSheet";

const tipoLabels: Record<string, string> = {
  autor: "Credor",
  reu: "Devedor",
  credor: "Credor",
  devedor: "Devedor",
  cedente: "Cedente",
  cessionario: "Cessionário",
  advogado: "Advogado",
  terceiro: "Terceiro",
};

export default function Pessoas() {
  const [search, setSearch] = useState("");
  const { data: allPessoas = [], isLoading } = usePessoas();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<PessoaDB | null>(null);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");

  const pessoas = allPessoas.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.cpf_cnpj.includes(q) || (p.email?.toLowerCase().includes(q));
  });

  const openCreate = () => {
    setSelectedPessoa(null);
    setSheetMode("create");
    setSheetOpen(true);
  };

  const openEdit = (p: PessoaDB) => {
    setSelectedPessoa(p);
    setSheetMode("edit");
    setSheetOpen(true);
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Pessoas</h1>
          <p className="text-sm text-muted-foreground mt-1">Cadastro de credores, devedores e envolvidos nos processos</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova Pessoa</Button>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CPF/CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
      </div>

      {pessoas.length === 0 && !search ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma pessoa cadastrada.</p>
          <Button variant="link" onClick={openCreate} className="mt-2">Cadastrar primeira pessoa</Button>
        </div>
      ) : (
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
                {pessoas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum resultado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pessoas.map(p => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(p)}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell className="font-mono text-xs">{p.cpf_cnpj}</TableCell>
                      <TableCell className="text-xs">{p.email ?? "—"}</TableCell>
                      <TableCell className="text-xs">{p.telefone ?? "—"}</TableCell>
                      <TableCell className="text-xs">{p.cidade && p.uf ? `${p.cidade}/${p.uf}` : "—"}</TableCell>
                      <TableCell><Badge variant="outline">{tipoLabels[p.tipo] ?? p.tipo}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <PessoaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pessoa={selectedPessoa}
        mode={sheetMode}
      />
    </div>
  );
}
