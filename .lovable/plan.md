

## Plano: Separar "Informar Dívida" e "Anexar Dívida"

### Conceito

São duas ações distintas:

1. **"Informar Dívida"** — Processo de comunicação ao tribunal. Ao clicar, executa uma sequência visual de etapas com progresso animado (spinner + checklist):
   - ✓ Compactando dados da dívida
   - ✓ Acessando tribunal
   - ⟳ Identificando autos...
   - ○ Anexando dívida ao processo
   - ○ Concluído
   
   Mostra um modal/dialog com stepper animado. Cada etapa roda por alguns segundos (simulado por enquanto, futuramente integrado). Ao final, marca como "enviado".

2. **"Anexar Dívida"** — Registrar manualmente uma dívida que o devedor possui com qualquer órgão, empresa, pessoa física ou governo. É o formulário atual do `ComunicarDividaSheet`, renomeado para "Anexar Dívida". Campos: credor/entidade, valor, descrição, tipo (empresa, governo, pessoa física, etc).

### Alterações

#### 1. Novo componente `InformarDividaDialog.tsx`
- Dialog modal com stepper vertical animado
- 5 etapas com ícones: check (concluído), loader spinning (em andamento), circle (pendente)
- Barra de progresso no topo
- Ao abrir, executa as etapas em sequência (simulado com timers, ~2s cada)
- Ao concluir, atualiza o status da dívida para "enviado" e fecha
- Recebe o `acompanhamento` como prop

#### 2. Renomear `ComunicarDividaSheet` → Ajustar para "Anexar Dívida"
- Trocar título para "Anexar Dívida"
- Ícone de Paperclip em vez de Gavel
- Adicionar campo "Credor/Entidade" (quem é o credor da dívida)
- Adicionar campo "Tipo" (select: Empresa, Governo, Pessoa Física, Órgão Público)
- Manter campos existentes (processo, tribunal, vara, UF, valores)

#### 3. Tabela `comunicacoes_divida` — novos campos
- Migração: adicionar `credor_nome text` e `tipo_credor text`

#### 4. `Acompanhamento.tsx` — Dois botões na linha da tabela
- Botão primário: **"Informar Dívida"** (ícone Gavel) → abre o dialog com stepper
- Botão outline: **"Anexar Dívida"** (ícone Paperclip) → abre o sheet/formulário atual
- Na sheet de detalhe: manter os dois botões também

#### 5. Hook `useComunicacoesDivida.ts`
- Aceitar `credor_nome` e `tipo_credor` no mutation

### UI do Stepper (InformarDividaDialog)

```text
┌─────────────────────────────────┐
│  Informar Dívida ao Tribunal    │
│  ━━━━━━━━━━━━━━━━━░░░░  60%    │
│                                 │
│  ✓  Compactando dados           │
│  ✓  Acessando tribunal          │
│  ⟳  Identificando autos...      │
│  ○  Anexando dívida ao processo │
│  ○  Finalizado                  │
│                                 │
│  Devedor: João Silva            │
│  CPF: 123.456.789-00            │
│                                 │
│              [Cancelar]         │
└─────────────────────────────────┘
```

### Arquivos

| Arquivo | Ação |
|---|---|
| Migração SQL | Adicionar `credor_nome` e `tipo_credor` em `comunicacoes_divida` |
| `src/components/acompanhamento/InformarDividaDialog.tsx` | Novo — stepper animado |
| `src/components/acompanhamento/ComunicarDividaSheet.tsx` | Renomear para "Anexar Dívida", adicionar campos credor |
| `src/pages/Acompanhamento.tsx` | Dois botões na tabela e no detalhe |
| `src/hooks/useComunicacoesDivida.ts` | Aceitar novos campos |

