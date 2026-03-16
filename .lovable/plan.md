

## Plano: Corrigir alinhamento header/body da tabela de Processos

### Problema raiz

A página usa duas `<Table>` separadas (linhas 273-289 e 291-382). Cada `Table` renderiza seu próprio `<div class="overflow-auto"><table>...</table></div>`. Como são tabelas independentes, o browser calcula as larguras de coluna separadamente — por isso o header nunca alinha com o body.

### Solução

Unificar em **uma única `<Table>`** com `table-fixed` layout e scroll apenas no container externo. O header fica visualmente fixo via `sticky top-0` no `<thead>`.

#### Mudanças em `src/pages/Processos.tsx`

1. Remover a estrutura de duas `<Table>` separadas
2. Usar uma única `<Table>` com classe `table-fixed` para forçar larguras consistentes
3. O container externo (`div.flex-1.overflow-y-auto`) controla o scroll
4. `<TableHeader>` usa `sticky top-0 z-10 bg-card` para ficar fixo durante scroll
5. Definir larguras proporcionais nas colunas via `w-[...]` ou porcentagens para distribuir o espaço corretamente:
   - Nº CNJ: ~14%
   - Tribunal: ~7%
   - Vara/Comarca: ~13%
   - Classe/Fase: ~13%
   - Triagem: ~11%
   - Status: ~7%
   - Trânsito: ~6%
   - Valor Est.: ~10%
   - Captação: ~8%
   - Analista: ~8%
   - Ações: ~3%

#### Resultado

- Header e body perfeitamente alinhados (mesma `<table>`)
- Scroll vertical funcional com header sticky
- Layout limpo sem bordas extras

