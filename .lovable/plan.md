

## Plano: Tela de Acompanhamento de Credores por CPF

### Conceito

Uma nova seção "Acompanhamento" no sistema onde o usuário seleciona/cria pessoas e habilita monitoramento do CPF/CNPJ. Uma automação externa (futura) vai popular os resultados. O sistema precisa das tabelas e UI para gerenciar isso.

### Nova tabela: `acompanhamentos`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| pessoa_id | uuid NOT NULL | Referência à pessoa monitorada |
| cpf_cnpj | text NOT NULL | CPF/CNPJ monitorado (copiado para facilitar automação) |
| ativo | boolean | Se o monitoramento está ativo |
| ultima_verificacao | timestamptz | Última vez que a automação verificou |
| total_processos_encontrados | integer | Contador de processos encontrados |
| observacoes | text | Notas livres |
| criado_por | uuid | Usuário que habilitou |
| created_at / updated_at | timestamptz | |

### Nova tabela: `acompanhamento_resultados`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| acompanhamento_id | uuid NOT NULL | FK para acompanhamentos |
| numero_processo | text | Nº CNJ encontrado |
| tribunal | text | Tribunal |
| dados_json | jsonb | Dados brutos retornados pela automação |
| vinculado | boolean | Se já foi importado/vinculado ao sistema |
| processo_id | uuid | Ref ao processo no sistema (se vinculado) |
| encontrado_em | timestamptz | Data que foi encontrado |
| created_at | timestamptz | |

### Nova página: `/acompanhamento`

- Listagem de pessoas com monitoramento ativo/inativo
- Busca por nome/CPF
- Botão para habilitar acompanhamento (selecionar pessoa existente ou criar nova)
- Cada linha mostra: Nome, CPF/CNPJ, Status (ativo/inativo), Última verificação, Processos encontrados
- Ao clicar, abre detalhe com os resultados encontrados pela automação

### Nova rota no sidebar

- Adicionar "Acompanhamento" na seção "Processos" do `CrmSidebar.tsx` com ícone `Radar` ou `Eye`

### Arquivos a criar/alterar

1. **Migração SQL** — Criar tabelas `acompanhamentos` e `acompanhamento_resultados` com RLS
2. **`src/hooks/useAcompanhamentos.ts`** — Hook CRUD para acompanhamentos e resultados
3. **`src/pages/Acompanhamento.tsx`** — Página principal com listagem e sheet para adicionar
4. **`src/components/CrmSidebar.tsx`** — Adicionar link na seção Processos
5. **`src/App.tsx`** — Adicionar rota `/acompanhamento`

