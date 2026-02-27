

## Plano: Supabase + Tela de Detalhe estilo Salesforce

### 1. Conectar Lovable Cloud (Supabase)

Ativar o Lovable Cloud e criar as tabelas:

```text
pessoas (id, nome, cpf_cnpj, email, telefone, endereco, cidade, uf, tipo, created_at)
equipes (id, nome, tipo, ativa, created_at)
usuarios (id, nome, email, equipe_id FK, cargo, avatar_url, ativo, created_at)
equipe_membros (id, equipe_id FK, usuario_id FK)  -- relação N:N

processos (id, numero_processo, tribunal, natureza, tipo_pagamento, 
  status_processo, transito_julgado, parte_autora, parte_re, 
  valor_estimado, data_distribuicao, data_captacao,
  triagem_resultado, triagem_observacoes, triagem_data, triagem_por FK,
  pipeline_status, pessoa_id FK, equipe_id FK, analista_id FK,
  -- campos de precificação (preenchidos depois)
  valor_precificado, precificacao_data, precificado_por FK,
  -- campos comercial
  tipo_servico, valor_proposta, valor_fechamento,
  data_fechamento, negocio_status,
  created_at, updated_at)
```

Unifica `ProcessoLead` e `Negocio` em uma única tabela `processos` que acompanha o lead por todo o pipeline -- como o usuário pediu.

Seed data com os mesmos dados mock atuais via migration.

### 2. Tela de Detalhe do Processo (estilo Salesforce)

Substituir o `TriageModal` por uma página dedicada `/processos/:id`:

```text
┌──────────────────────────────────────────────────────────┐
│  ← Voltar    #0001234-56.2024...    [Pipeline: Triagem ▾]│
│  Maria Silva Santos · TJSP · Precatório · R$ 85.000     │
├──────────────────────────────────────────────────────────┤
│  [Dados do Processo] [Triagem] [Análise] [Precif.] [Com]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ Informações Gerais ──────┐  ┌─ Triagem ───────────┐ │
│  │ Tribunal: TJSP            │  │ Resultado: Pendente  │ │
│  │ Natureza: Cível           │  │ Trânsito: Sim        │ │
│  │ Tipo Pgto: Precatório     │  │ Status: S3           │ │
│  │ Parte Autora: Maria...    │  │ Observações: ...     │ │
│  │ Parte Ré: INSS            │  │                      │ │
│  │ Valor Est: R$ 85.000      │  │ [Apto] [Reanálise]   │ │
│  │ Data Dist: 15/03/2024     │  │ [Descartar]          │ │
│  └───────────────────────────┘  └──────────────────────┘ │
│                                                          │
│  ┌─ Timeline / Histórico ────────────────────────────┐   │
│  │ 27/02 - Lead captado                              │   │
│  │ 27/02 - Enviado para triagem                      │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

Campos editáveis inline. Tabs para seções do pipeline (dados visíveis conforme a etapa avança). Botões de ação contextual por etapa.

### 3. Etapas de Implementação

**Etapa 1 -- Supabase schema + seed**
- Criar tabela `pessoas`, `equipes`, `usuarios`, `equipe_membros`, `processos`
- RLS básica (sem auth por enquanto, policies permissivas para desenvolvimento)
- Seed com dados mock atuais

**Etapa 2 -- Hooks e integração de dados**
- Criar hooks com TanStack Query: `useProcessos`, `usePessoas`, `useEquipes`, `useProcesso(id)`
- Substituir imports de mock-data pelos hooks em todas as páginas

**Etapa 3 -- Página de detalhe do processo**
- Nova rota `/processos/:id` com layout Salesforce-like
- Seções: Dados Gerais, Triagem (com botões Apto/Descartar/Reanálise), Timeline
- Tabs para etapas futuras (Análise, Precificação, Comercial) -- visíveis mas desabilitadas até o processo chegar lá
- Na tabela de triagem, clicar no processo navega para `/processos/:id` em vez de abrir modal

**Etapa 4 -- Atualizar páginas existentes**
- Dashboard, Triagem, Pessoas, Equipes: todos lendo do Supabase
- Triagem: tabela com link para detalhe, sem modal
- Pessoas/Equipes: CRUD funcional com Supabase

### Detalhes Técnicos

- Supabase client via `@supabase/supabase-js` (já disponível com Lovable Cloud)
- TanStack Query para cache e mutations
- Tabela unificada `processos` com `pipeline_status` controlando em qual etapa está
- Campos de precificação/comercial ficam null até o processo chegar nessas etapas
- Componente `ProcessoDetail` com layout de grid 2 colunas, cards por seção

