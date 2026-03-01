

## Tela de Processos Completa + Fluxo Processo → Negócio

### Contexto
Hoje não existe uma página dedicada para listar **todos os processos** do sistema com filtros avançados. A página de Triagem lista apenas processos em `pipeline_status = "triagem"`. Precisamos de uma tela central de Processos com listagem completa, filtros, e ao clicar abrir o detalhe com todas as informações (partes, documentos, etc). O fluxo é: **Processos → quando apto → vira Negócio → segue no CRM**.

### O que será construído

**1. Nova página `/processos` — Listagem completa**
- Busca **todos** os processos (sem filtro de pipeline_status)
- Sem big numbers/stats cards
- Filtros: por tribunal, natureza, tipo pagamento, pipeline_status, triagem_resultado, trânsito em julgado
- Busca por texto (número, parte autora, parte ré)
- Tabela com colunas: Número, Tribunal, Natureza, Parte Autora, Tipo Pagamento, Status Pipeline, Triagem, Valor Estimado, Data Captação
- Clique na linha → navega para `/processos/:id`

**2. Atualizar `/processos/:id` — Detalhe completo**
- Reorganizar abas: **Dados Gerais | Partes | Documentos | Triagem | Análise | Precificação | Comercial**
- Aba **Partes**: mostra parte autora/ré com dados da pessoa vinculada (se houver), contatos
- Aba **Documentos**: placeholder para futuro upload de documentos do processo
- Manter edição inline existente
- Quando processo está "apto" e avança, o botão "Criar Negócio" já existe na aba Comercial

**3. Atualizar sidebar**
- Adicionar "Processos" no menu (entre Dashboard e Pipeline/Triagem), com ícone `Scale` ou `Gavel`
- Reorganizar: Dashboard → **Processos** → Pipeline (Triagem, Distribuição, Análise, Precificação, Comercial, Negócios)

**4. Atualizar rotas**
- Adicionar rota `/processos` apontando para a nova página
- Manter `/processos/:id` para detalhe

### Detalhes Técnicos

- Nova página `src/pages/Processos.tsx` usando `useProcessos()` sem parâmetro (busca tudo)
- Filtros com `Select` components e estado local, aplicados via `useMemo`
- Reutilizar `ProcessStatusBadge`, `TriageBadge` e badges de pipeline existentes
- Atualizar `CrmSidebar.tsx` para incluir o item "Processos" no menu
- Atualizar `App.tsx` para adicionar a rota
- Atualizar `ProcessoDetalhe.tsx` para incluir abas "Partes" e "Documentos" (placeholder)

