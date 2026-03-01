

## Reestruturar Processos para Analistas + Negócios com Etapas

### Contexto
Analistas precisam processar ~1000 processos/dia. A tela atual tem abas demais e pipeline steps que pertencem a negócios, não a processos. Processos são dados judiciais puros. Negócios têm etapas comerciais e podem existir sem processo.

### 1. Listagem `/processos` — Otimizada para volume

**Filtro de data completo** (DateRange picker):
- Período de captação (data_captacao) com presets: Hoje, 7d, 30d, 90d, custom range
- Usar Popover + Calendar (mode="range") com date-fns

**Paginação server-side** via Supabase `.range()` para suportar milhões de registros — exibir 50 por página com controles prev/next e contagem total

**Tabela densa** com linhas compactas, link direto para consulta pública do tribunal (formato URL por tribunal), informações-chave visíveis sem clicar

**Remover conceito de "pipeline" da listagem** — substituir por status simples do processo (triagem_resultado) já que pipeline pertence a negócios

### 2. Detalhe `/processos/:id` — One Page para Análise

**Layout single-page** sem abas — tudo visível de uma vez, inspirado na experiência dos tribunais:
- **Cabeçalho**: número do processo (link para tribunal), tribunal, natureza, tipo pagamento, valor estimado, trânsito
- **Seção Partes**: autora e ré lado a lado
- **Seção Análise/Triagem**: botões de ação rápida (Apto/Descartar/Reanálise), observações inline
- **Seção Negócios vinculados**: lista de negócios existentes + botão criar (crédito advogado, crédito autores, etc.)
- **Timeline** compacta no rodapé

Remover as abas separadas (Dados, Partes, Documentos, Triagem, Análise, Precificação, Comercial) — consolidar em seções visuais na mesma página

### 3. Modelo de Negócios — Etapas + Independente de Processo

**Migration**: tornar `processo_id` nullable na tabela `negocios` (negócio pode existir sem processo)

**Página `/negocios`**: adicionar filtros, busca, e ao clicar abrir detalhe do negócio com suas etapas (em_andamento → proposta → negociação → ganho/perdido)

### 4. Ajustes no Sidebar

Reorganizar: separar "Processos" (análise técnica) de "Negócios" (CRM comercial) visualmente

### 5. Remover pipeline_status de processos

O campo `pipeline_status` na tabela processos será mantido por compatibilidade mas não será mais exibido na listagem — a progressão comercial agora vive em `negocios.negocio_status`

### Arquivos afetados
- `src/pages/Processos.tsx` — reescrever com date range filter, paginação server-side, layout denso
- `src/pages/ProcessoDetalhe.tsx` — reescrever como one-page sem abas
- `src/pages/Negocios.tsx` — adicionar filtros e detalhe
- `src/hooks/useProcessos.ts` — adicionar suporte a paginação e filtro de data server-side
- `src/hooks/useNegocios.ts` — atualizar para processo_id nullable
- Migration SQL — ALTER TABLE negocios ALTER COLUMN processo_id DROP NOT NULL

