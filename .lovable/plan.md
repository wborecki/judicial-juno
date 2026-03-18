

## Plano: Comunicar Dívida ao Juiz

### Conceito

Dentro do detalhe de um acompanhamento (sheet lateral), adicionar um botão "Comunicar Dívida ao Juiz" que abre uma nova Sheet/Dialog com uma ficha completa. A ficha será preenchida com dados do processo, pessoa e valores de crédito/dívida. Os envios serão salvos em uma nova tabela para histórico, e futuramente serão integrados com APIs do PJE e EPROC.

### Nova tabela: `comunicacoes_divida`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| acompanhamento_id | uuid NOT NULL | FK para acompanhamentos |
| pessoa_id | uuid | Pessoa/credor |
| numero_processo | text NOT NULL | Nº do processo judicial |
| tribunal | text | Tribunal do processo |
| valor_credito | numeric | Valor do crédito da pessoa |
| valor_divida | numeric | Valor da dívida a comunicar |
| dados_pessoa | jsonb | Snapshot dos dados da pessoa (nome, CPF, endereço) |
| observacoes | text | Notas adicionais |
| status | text | 'rascunho', 'pendente', 'enviado', 'erro' (default 'pendente') |
| enviado_em | timestamptz | Data do envio futuro via API |
| criado_por | uuid | Usuário que criou |
| created_at | timestamptz | |

RLS: authenticated users can manage.

### Alterações na UI

1. **Sheet de detalhe do acompanhamento** — Adicionar botão "Comunicar Dívida ao Juiz" com ícone `Send` ou `Gavel`
2. **Nova Sheet `ComunicarDividaSheet`** — Formulário com:
   - Número do processo (input text)
   - Tribunal (select com lista existente de TRIBUNAIS)
   - Dados da pessoa (pré-preenchidos e readonly: nome, CPF/CNPJ, endereço)
   - Valor do crédito (input numérico)
   - Valor da dívida (input numérico)
   - Observações (textarea)
   - Botão "Registrar Comunicação"
3. **Histórico de comunicações** — Listagem das comunicações já registradas dentro do detalhe do acompanhamento

### Arquivos a criar/alterar

1. **Migração SQL** — Criar tabela `comunicacoes_divida` com RLS
2. **`src/hooks/useComunicacoesDivida.ts`** — Hook para listar e criar comunicações
3. **`src/components/acompanhamento/ComunicarDividaSheet.tsx`** — Sheet com o formulário da ficha
4. **`src/pages/Acompanhamento.tsx`** — Adicionar botão e integrar a nova sheet no detalhe

