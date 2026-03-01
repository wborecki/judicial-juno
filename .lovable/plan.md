

## Plano: Processo Detalhe Completo

O processo atual armazena `parte_autora` e `parte_re` como campos de texto simples e nao tem suporte a andamentos, documentos ou edicao inline. Vou reestruturar isso completamente.

---

### 1. Novas Tabelas no Banco de Dados (migration)

**`processo_partes`** — Multiplos autores e reus por processo
| Coluna | Tipo |
|---|---|
| id | uuid PK |
| processo_id | uuid FK processos |
| nome | text |
| cpf_cnpj | text nullable |
| tipo | text ('autor' / 'reu') |
| pessoa_id | uuid FK pessoas nullable |
| created_at | timestamptz |

**`processo_andamentos`** — Movimentacoes processuais
| Coluna | Tipo |
|---|---|
| id | uuid PK |
| processo_id | uuid FK processos |
| data_andamento | timestamptz |
| titulo | text |
| descricao | text nullable |
| tipo | text ('despacho', 'decisao', 'sentenca', 'intimacao', 'peticao', 'outros') |
| criado_por | uuid nullable |
| created_at | timestamptz |

**`processo_documentos`** — Documentos uploadados
| Coluna | Tipo |
|---|---|
| id | uuid PK |
| processo_id | uuid FK processos |
| nome | text |
| arquivo_url | text |
| arquivo_nome | text |
| tamanho | bigint nullable |
| tipo_documento | text ('peticao', 'sentenca', 'recurso', 'procuracao', 'comprovante', 'outros') |
| criado_por | uuid nullable |
| created_at | timestamptz |

- Storage bucket `processo-documentos` (public) para os arquivos
- RLS permissiva (`true`) em todas as novas tabelas (padrao atual do projeto)

### 2. Hooks (src/hooks/)

- **`useProcessoPartes.ts`** — CRUD para partes (listar, adicionar, remover por processo_id)
- **`useProcessoAndamentos.ts`** — CRUD para andamentos (listar ordenado por data desc, criar, deletar)
- **`useProcessoDocumentos.ts`** — CRUD para documentos (listar, upload com storage, deletar)

### 3. Pagina ProcessoDetalhe Refatorada com Abas

Reorganizar a pagina usando `Tabs` com as seguintes abas:

- **Dados Gerais** — Cabecalho com informacoes editaveis inline (tribunal, natureza, tipo pagamento, status, transito julgado, valor estimado, observacoes). Botao de editar que transforma campos em inputs/selects.
- **Partes** — Lista de autores e reus com botao para adicionar novo. Cada parte pode ser removida. Vinculacao opcional com pessoa cadastrada.
- **Andamentos** — Timeline vertical de movimentacoes com data, tipo (badge colorido), titulo e descricao. Formulario para adicionar novo andamento no topo.
- **Documentos** — Lista de documentos com nome, tipo, data de upload. Botao de upload (drag-and-drop ou file input). Download e exclusao.
- **Triagem** — Secao atual de triagem (observacoes + botoes apto/reanalise/descartar)
- **Negocios** — Secao atual de negocios vinculados

### 4. Edicao Inline dos Dados do Processo

Na aba "Dados Gerais", um botao "Editar" ativa modo de edicao onde os campos do cabecalho (tribunal, natureza, tipo_pagamento, status_processo, transito_julgado, valor_estimado, data_distribuicao, observacoes) se tornam editaveis com selects/inputs. Botoes "Salvar" e "Cancelar" para confirmar.

### Resumo Tecnico

- 1 migration SQL com 3 tabelas + 1 storage bucket + RLS policies
- 3 novos hooks
- ProcessoDetalhe.tsx reescrito com Tabs e componentes internos para cada aba
- Campos editaveis usando estado local + useUpdateProcesso existente

