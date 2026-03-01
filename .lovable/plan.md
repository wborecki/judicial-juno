

## Plano: Redesign ProcessoDetalhe — Layout 2 Colunas com Painel Lateral

Transformar a tela de detalhe do processo de um layout de abas para um layout operacional de 2 colunas: conteúdo principal com blocos accordion + painel lateral fixo de Triagem/Conversão.

---

### 1. Estrutura do Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│  Header fixo: CNJ (copiar) + Badges + Status + Ações           │
├─────────────────────────────────────────────────────────────────┤
│  Resumo executivo: 6 mini-cards em grid                        │
├──────────────────────────────────────┬──────────────────────────┤
│  Conteúdo principal (accordion)      │  Painel lateral fixo     │
│                                      │                          │
│  A) Dados do Processo                │  Triagem                 │
│  B) Partes                           │  - Status + Score        │
│  C) Movimentações (tabela simples)   │  - Observações           │
│  D) Documentos                       │  - Motivo (se inapto)    │
│  E) Financeiro/RPV                   │  - Botões Apto/Inapto    │
│  F) Relacionados                     │                          │
│  G) Notas internas                   │  Conversão               │
│                                      │  - Criar Negócio         │
│                                      │  - Negócios existentes   │
└──────────────────────────────────────┴──────────────────────────┘
```

Layout: `grid grid-cols-1 lg:grid-cols-[1fr_320px]` — coluna principal + painel lateral sticky.

---

### 2. Arquivos a Criar/Modificar

**`src/pages/ProcessoDetalhe.tsx`** — Reescrever completamente:
- Remover Tabs, usar layout 2 colunas
- Header fixo com CNJ (botão copiar), badges inline (Tribunal, Área, Tipo RPV/Precatório, Classe/Fase, Trânsito), status triagem, ações (Editar Valor, Criar Negócio condicional, menu dropdown)
- Grid de 6 mini-cards resumo executivo
- Coluna principal com accordions
- Coluna lateral com componente de triagem + conversão

**`src/components/processo/ProcessoHeader.tsx`** — Novo componente:
- CNJ com botão copiar (clipboard API)
- Badges: Tribunal, Natureza, Tipo Pagamento, Classe/Fase, Trânsito (Sim/Não com cor)
- Badge de triagem colorido
- Ações: botão Editar Valor (abre modal inline), Criar Negócio (só se apto), dropdown com mais ações

**`src/components/processo/ProcessoResumo.tsx`** — Novo componente (6 cards):
- Valor estimado (destaque)
- Último movimento (data + título, fetch do andamento mais recente)
- Prazos (placeholder "Nenhum" por enquanto — campo não existe no schema)
- Triagem (status + data)
- Risco (placeholder Baixo/Médio/Alto — campo não existe, usar lógica básica por valor/trânsito)
- Negócio (não criado / em andamento / fechado — fetch de negocios)

**`src/components/processo/PainelTriagem.tsx`** — Novo componente (painel lateral):
- Status atual da triagem com badge colorido
- Observações (textarea)
- Motivo inaptidão (input, obrigatório se inapto)
- Botões: Marcar Apto / Marcar Inapto / Reanálise
- Seção Conversão: botão "Criar Negócio" (só se apto), lista de negócios existentes com status

**Componentes accordion existentes reutilizados** (refatorados para accordion):
- `TabDadosGerais.tsx` → Accordion "Dados do Processo" (remover card wrapper, adaptar para AccordionContent)
- `TabPartes.tsx` → Accordion "Partes" (preview no header: "3 autores, 2 réus")
- `TabAndamentos.tsx` → Accordion "Movimentações" (preview: "10 movimentações, última em 02/09/2024")
- `TabDocumentos.tsx` → Accordion "Documentos" (preview: "5 documentos")

**Novos blocos accordion (placeholder/mock por enquanto):**
- Financeiro/RPV/Precatório — card estático com campos: número requisitório, ente devedor, data-base, valor, deduções, valor líquido, LOA, status. Dados não existem no schema, será placeholder.
- Relacionados — card estático listando "Processo principal", "Cumprimentos", "Apensos". Placeholder.
- Notas internas — textarea simples para adicionar notas. Placeholder sem persistência (tabela não existe).

---

### 3. Resumo Técnico

- Sem alteração no banco de dados (nenhuma migration)
- Sem novos hooks (reutilizar useProcesso, useProcessoAndamentos, useProcessoDocumentos, useProcessoPartes, useNegocios, useUpdateProcesso)
- 3 novos componentes: ProcessoHeader, ProcessoResumo, PainelTriagem
- ProcessoDetalhe.tsx reescrito com layout 2 colunas + accordion
- Componentes existentes (TabDadosGerais, TabPartes, TabAndamentos, TabDocumentos) adaptados para funcionar dentro de AccordionContent (remover Card wrapper externo)
- TabTriagem e TabNegocios removidos como abas — funcionalidade movida para PainelTriagem
- Blocos Financeiro, Relacionados e Notas como placeholders estáticos

