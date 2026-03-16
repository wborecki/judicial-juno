

## Plano: Reformular status de triagem dos processos

### Problema atual
O campo `triagem_resultado` usa o valor "apto" como status, mas isso não faz sentido no fluxo real:
- Processo chega via captação automática → status **pendente**
- Analista revê o processo e decide: **Criar Negócio**, **Acompanhar** ou **Descartar**
- Se cria negócio, o processo deveria ficar como **"convertido"** (virou negócio), não "apto"
- "Apto" é redundante — se está apto, a ação é criar negócio

### Novo modelo de status

| Valor BD | Label | Cor | Significado |
|---|---|---|---|
| `pendente` | Pendente | warning/amarelo | Processo captado, aguardando análise |
| `em_acompanhamento` | Em Acompanhamento | info/azul | Analista monitorando, ainda não decidiu |
| `convertido` | Convertido | success/verde | Negócio criado a partir deste processo |
| `descartado` | Descartado | destructive/vermelho | Processo descartado |

**Remove**: `apto` e `reanálise`
**Adiciona**: `convertido` e `em_acompanhamento`

### Arquivos a alterar

1. **`src/lib/types.ts`** — Atualizar `TriageResult` type
2. **`src/components/StatusBadge.tsx`** — Atualizar labels e cores
3. **`src/components/processo/ProcessoHeader.tsx`** — Trocar `TRIAGEM_LABELS`/`TRIAGEM_COLORS`, badge "Apto" → lógica com novos status
4. **`src/components/processo/ModalConverter.tsx`** — Ao criar negócio, marcar como `convertido` em vez de `apto`
5. **`src/components/processo/TabTriagem.tsx`** — Atualizar labels e ações
6. **`src/components/TriageModal.tsx`** — Atualizar botões de triagem
7. **`src/pages/Processos.tsx`** — Atualizar filtros e cores de triagem
8. **`src/pages/Triagem.tsx`** — Atualizar tabs e contadores
9. **`src/pages/ProcessoDetalhe.tsx`** — Atualizar ações de acompanhamento: usar `em_acompanhamento` em vez de `reanálise`, e ao remover usar `pendente`
10. **`src/hooks/useProcessos.ts`** — Stats: trocar `apto` → `convertido`
11. **`src/hooks/useDistribuicao.ts`** — Fila de processos: filtrar por `pendente` (sem analista) em vez de `apto`
12. **`src/lib/mock-data.ts`** — Atualizar dados mock

### Lógica de transição

- **Criar Negócio** → `triagem_resultado = "convertido"`
- **Acompanhar** → `triagem_resultado = "em_acompanhamento"`
- **Remover Acompanhamento** → `triagem_resultado = "pendente"`
- **Descartar** → `triagem_resultado = "descartado"` (sem mudança)

### Nota sobre dados existentes
Processos com `triagem_resultado = "apto"` ou `"reanálise"` no banco precisarão de uma migração SQL para mapear:
- `apto` → `convertido`
- `reanálise` → `em_acompanhamento`

