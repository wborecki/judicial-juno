

## Plano: Melhorar nitidez e legibilidade das tabelas

### Problemas identificados
- Fontes muito pequenas (`text-[9px]`, `text-[10px]`, `text-[11px]`) prejudicam leitura
- Linhas muito comprimidas (`h-9`, `py-1.5`) criam sensação de "apertado"
- Falta contraste visual entre linhas (sem zebra-striping)
- Header da tabela pouco destacado do conteúdo
- Bordas entre linhas muito sutis (`border-border/20`)

### Alteracoes

**1. Componente base `table.tsx`** -- ajustes globais que beneficiam todas as tabelas:
- `TableHead`: subir de `h-12 px-4` para `h-10 px-3` com `bg-muted/30` e `text-xs` base
- `TableCell`: de `p-4` para `px-3 py-2.5`
- `TableRow`: adicionar zebra-striping com `even:bg-muted/20` e bordas mais visíveis `border-border/40`

**2. Página `Processos.tsx`** -- elevar tamanhos de fonte inline:
- Headers: de `text-[10px]` para `text-[11px]`
- Cells de conteúdo: de `text-[10px]`/`text-[11px]` para `text-xs` (12px)
- Badges: de `text-[9px]` para `text-[10px]`
- Número CNJ (mono): de `text-[11px]` para `text-xs`
- Altura da linha: de `h-9` para `h-10`

**3. Página `Analise.tsx`** -- mesma padronização:
- Headers e cells seguem o mesmo aumento de `text-[10px]` para `text-[11px]` e cells para `text-xs`

**4. CSS global `index.css`** -- adicionar utilitário de antialiasing:
- Adicionar `-webkit-font-smoothing: antialiased` e `text-rendering: optimizeLegibility` ao body para melhorar renderização de fontes pequenas

### Resultado esperado
Tabelas com texto mais legível, espaçamento confortável, contraste entre linhas alternadas e renderização de fonte mais nítida em todos os navegadores.

