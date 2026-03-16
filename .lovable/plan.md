

## Plano: Tabela bonita e consistente em todo o sistema

### Problema

1. O componente `Table` adiciona `border border-border rounded-lg bg-background` no wrapper
2. Várias páginas (Processos, Carteira, Análise, etc.) também envolvem a tabela em `glass-card rounded-xl overflow-hidden` — gerando **bordas duplas**
3. A página de Processos usa **duas `<Table>` separadas** (header sticky + body scroll), cada uma criando seu próprio wrapper com borda — ficando visualmente quebrado
4. As cores de fundo conflitam (`bg-background` vs `bg-card`)

### Solução

**Princípio**: O componente `Table` deve ser **neutro** — sem borda nem fundo próprio. O container externo (que cada página já define) cuida da aparência.

#### 1. Simplificar `src/components/ui/table.tsx`

- **Table wrapper**: Remover `border`, `rounded-lg`, `bg-background`. Deixar apenas `relative w-full overflow-auto`
- **TableRow**: Manter zebra-striping `even:bg-muted/30`, hover `hover:bg-muted/50`, borda `border-b border-border/50`
- **TableHead**: Manter `bg-muted/40` para contraste sutil, `text-[11px] font-semibold uppercase tracking-wider`
- **TableCell**: Manter `px-3 py-2.5 text-xs`

#### 2. Páginas que usam tabelas — ajustar containers

As páginas já têm `glass-card rounded-xl overflow-hidden` como container. Isso fica como o visual padrão. Sem mudanças nas páginas.

Com o `Table` neutro, as páginas controlam borda/fundo via `glass-card`, e a tabela de Processos (com 2 `<Table>`) não terá mais bordas duplicadas.

### Resultado esperado

- Tabelas com fundo branco (`bg-card` via `glass-card`)
- Borda única sutil ao redor
- Header com fundo levemente acinzentado
- Listras alternadas sutis
- Sem bordas duplas em nenhuma página

### Arquivo editado

- `src/components/ui/table.tsx` (única mudança)

