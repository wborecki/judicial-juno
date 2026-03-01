

## Reestruturação do Modelo de Dados — Separar Negócios de Processos + Criar Contatos

### Problema Atual
Hoje, a tabela `processos` acumula campos de negócio (`negocio_status`, `valor_proposta`, `valor_fechamento`, `data_fechamento`, `tipo_servico`). Isso mistura conceitos: um processo judicial é diferente de um negócio/oportunidade comercial. Além disso, não existe a entidade "contatos" (telefone, email de contato ligados a uma pessoa).

### Novo Modelo de Dados

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   processos  │────→│   negocios   │────→│   pessoas    │
│              │ 1:N │              │     │              │
│ dados do     │     │ tipo_servico │     │ nome, cpf    │
│ processo     │     │ status       │     │ tipo         │
│ judicial     │     │ valor_prop.  │     └──────┬───────┘
│ triagem      │     │ valor_fech.  │            │ 1:N
│ pipeline     │     │ data_fech.   │     ┌──────┴───────┐
│ análise      │     │ observacoes  │     │   contatos   │
└──────────────┘     └──────────────┘     │              │
                                          │ tipo (tel,   │
┌──────────────┐     ┌──────────────┐     │  email, etc) │
│   equipes    │────→│equipe_membros│     │ valor        │
└──────────────┘     └──────┬───────┘     │ principal    │
                            │             └──────────────┘
                     ┌──────┴───────┐
                     │   usuarios   │
                     └──────────────┘
```

### Etapa 1 — Migration: Criar tabela `negocios`

Nova tabela `negocios` com:
- `id`, `processo_id` (FK → processos), `pessoa_id` (FK → pessoas)
- `tipo_servico`, `negocio_status` (em_andamento, ganho, perdido)
- `valor_proposta`, `valor_fechamento`, `data_abertura`, `data_fechamento`
- `responsavel_id` (FK → usuarios), `observacoes`
- `created_at`, `updated_at`
- RLS permissiva (fase dev)

Migrar dados existentes: INSERT INTO `negocios` SELECT dos campos de negócio que já estão em `processos` (onde `negocio_status IS NOT NULL`).

Remover colunas de negócio da tabela `processos`: `negocio_status`, `valor_proposta`, `valor_fechamento`, `data_fechamento`, `tipo_servico`.

### Etapa 2 — Migration: Criar tabela `contatos`

Nova tabela `contatos`:
- `id`, `pessoa_id` (FK → pessoas)
- `tipo` (telefone, email, whatsapp, outro)
- `valor` (o número/email em si)
- `principal` (boolean, default false)
- `observacoes`
- `created_at`
- RLS permissiva (fase dev)

### Etapa 3 — Hooks e tipos

- Criar `useNegocios.ts` com queries para listar, buscar por ID, criar e atualizar negócios
- Criar `useContatos.ts` com queries para listar contatos de uma pessoa
- Atualizar `useProcessos.ts` removendo campos de negócio do tipo `Processo`
- Atualizar `src/lib/types.ts` com as novas interfaces

### Etapa 4 — Atualizar páginas

- **Negocios.tsx**: Buscar da tabela `negocios` (join com processos e pessoas) em vez de filtrar processos
- **ProcessoDetalhe.tsx**: Aba "Comercial" agora lista/cria negócios vinculados ao processo. Botão "Criar Negócio" quando processo está apto
- **Dashboard.tsx**: Ajustar KPIs para consultar `negocios` separadamente
- **Pessoas.tsx**: Adicionar coluna/seção de contatos
- **CrmSidebar.tsx**: Adicionar "Contatos" ao menu de Cadastros (opcional, pode ficar dentro de Pessoas)

### Etapa 5 — Seed data

- Inserir negócios de exemplo nas diferentes fases
- Inserir contatos vinculados às pessoas existentes

### Detalhes Técnicos

- A migration será feita em uma única SQL com: CREATE TABLE negocios, INSERT INTO negocios (migração), ALTER TABLE processos DROP COLUMN (5 colunas), CREATE TABLE contatos
- O `pipeline_status` do processo continua existindo (captado → triagem → distribuido → em_analise → precificado → comercial), mas "ganho"/"perdido" passam a ser status do negócio, não do processo
- Um processo pode ter múltiplos negócios (ex: compra de crédito + compensação tributária)
- Contatos ficam dentro da página de detalhe da Pessoa, sem rota separada

