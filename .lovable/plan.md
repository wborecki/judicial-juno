

## Plano: Evolução para CRM Completo de Gestão de Ativos Judiciais

O sistema atual é só o módulo de triagem. O usuário descreveu um CRM completo com pipeline de negócios. Vou reestruturar a navegação e criar a arquitetura completa.

### Arquitetura do Sistema (Módulos)

```text
┌─────────────────────────────────────────────────────┐
│                   SIDEBAR (módulos)                  │
├─────────────────────────────────────────────────────┤
│  📊 Dashboard (visão geral / KPIs)                  │
│                                                      │
│  ── PIPELINE ──                                      │
│  📥 Captação (upload JSON / leads novos)             │
│  🔍 Triagem (pendente/apto/descartado) ← JÁ EXISTE  │
│  📤 Distribuição (roteamento por equipe)             │
│  📝 Análise (preenchimento de dados)                 │
│  💰 Precificação (equipe financeira)                 │
│  📞 Comercial (contato / fechamento)                 │
│  ✅ Negócios (ganhos / perdidos / em andamento)      │
│                                                      │
│  ── CADASTROS ──                                     │
│  👥 Pessoas (partes dos processos - nome/CPF/tel)    │
│  🏢 Equipes (config de roteamento RPV/Precatório)    │
│  👤 Usuários (analistas do sistema)                  │
│                                                      │
│  ── SISTEMA ──                                       │
│  💬 Chat interno (futuro)                            │
│  ⚙️ Configurações                                    │
└─────────────────────────────────────────────────────┘
```

### Etapas de Implementação

**1. Reestruturar navegação e roteamento**
- Transformar a sidebar de filtros de triagem para navegação por módulos do CRM
- Criar rotas: `/`, `/triagem`, `/distribuicao`, `/analise`, `/precificacao`, `/comercial`, `/negocios`, `/pessoas`, `/equipes`
- Layout compartilhado com sidebar persistente

**2. Expandir tipos e modelos de dados**
- Adicionar tipos: `Pessoa` (nome, CPF, email, telefone, endereço), `Equipe` (nome, tipo: RPV/Precatório/etc, membros), `Negocio` (processo vinculado, tipo de serviço, status do negócio, valor)
- Adicionar `TipoServico`: compra de crédito judicial, compensação tributária, etc
- Adicionar pipeline status ao `ProcessoLead`: triagem → distribuído → em análise → precificado → comercial → ganho/perdido
- Vincular `pessoaId` ao processo (parte autora como cadastro)

**3. Criar páginas-esqueleto dos módulos**
- Cada módulo com sua página, header, e conteúdo inicial (tabela ou kanban conforme o módulo)
- Dashboard com KPIs do pipeline completo
- Página de Pessoas com CRUD
- Página de Equipes com configuração de roteamento

**4. Implementar Distribuição**
- Após triagem "apto", processo entra na fila de distribuição
- Roteamento automático por regras: RPV → Equipe RPV, Precatório → Equipe Precatório
- Atribuição manual ou automática a analistas

**5. Implementar módulo de Negócios**
- Kanban ou tabela com status: Em Andamento, Ganho, Perdido
- Tipo de serviço vinculado
- Histórico de interações

### Detalhes Técnicos

- Roteamento via `react-router-dom` com layout aninhado (sidebar + outlet)
- Dados mock expandidos para todos os módulos
- Tipos centralizados em `src/lib/types.ts`
- Componentes de página em `src/pages/` (Dashboard, Triagem, Distribuicao, Analise, Precificacao, Comercial, Negocios, Pessoas, Equipes)
- Sidebar refatorada para navegação por rotas com ícones e contadores
- Banco de dados (Supabase) será conectado numa etapa futura

### Escopo desta implementação
Vou focar em: **reestruturar a navegação completa do CRM, criar as páginas-esqueleto de todos os módulos, expandir os tipos de dados, e implementar o módulo de Pessoas e Equipes** -- mantendo a triagem funcional como já está. Os módulos de Distribuição, Precificação e Comercial terão a estrutura pronta para serem desenvolvidos iterativamente.

