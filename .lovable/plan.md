

## Reestruturar "Busca de Devedor" — linha = processo, dívidas = da pessoa

### Entendimento

- Cada **linha da tabela principal** é um **processo** (com número, valor, vara, UF).
- O **nome e CPF** são da pessoa (autora do processo).
- **Dívidas pertencem à pessoa**, não ao processo — aparecem no sheet lateral ao clicar na linha.
- "Tipo Dívida" **não faz sentido** na tabela principal.
- No sheet: seção de "Dívidas Registradas" + botão "Anexar Dívida" (na pessoa).

### 1. Adicionar campos de processo na tabela `acompanhamentos`

Migration SQL para adicionar:
- `numero_processo` (text, nullable)
- `valor_processo` (numeric, nullable)  
- `vara` (text, nullable)
- `uf` (text, nullable)

### 2. Reestruturar tabela principal (`Acompanhamento.tsx`)

Colunas novas:

| Coluna | Dados |
|---|---|
| Nome | `pessoas.nome` (autor) |
| CPF/CNPJ | `cpf_cnpj` |
| Nº Processo | `numero_processo` (campo novo) |
| Valor | `valor_processo` (campo novo) |
| Vara | `vara` (campo novo) |
| Estado | `uf` (campo novo) |
| Dívidas | badge com `total_dividas` |
| Ações | Informar Dívida + Excluir |

Remover referências a `ultima_divida` nas células da tabela.

### 3. Atualizar formulário "Novo Acompanhamento"

Adicionar campos ao formulário de criação:
- Número do Processo (text input)
- Valor do Processo (number input)
- Vara (text input)
- UF (select com estados)

### 4. Sheet lateral (detalhe)

Manter estrutura atual: info do devedor no topo, lista de dívidas registradas da pessoa abaixo. "Anexar Dívida" continua anexando na pessoa (sem campo de nº processo no formulário de dívida — já está correto).

### 5. Ajustar hook `useAcompanhamentos`

O hook já traz `total_dividas`. Manter essa lógica. Os novos campos (`numero_processo`, `valor_processo`, `vara`, `uf`) vêm automaticamente do `select("*")`.

### Arquivos impactados
- `supabase/migrations/` — nova migration (4 colunas)
- `src/pages/Acompanhamento.tsx` — tabela + formulário de criação
- `src/hooks/useAcompanhamentos.ts` — sem mudanças necessárias (select * já traz)

