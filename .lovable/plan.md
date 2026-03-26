

## Plano: Reestruturar Busca de Devedor — Novas Colunas + Foco em Dívidas

### Resumo

Trocar as colunas da tabela principal para: **Nome, CPF/CNPJ, Processo, Valor, Vara, Estado**. No detalhe (sheet lateral), listar **dívidas** em vez de processos, com botao para incluir nova divida. Adicionar botao "Informar Divida" direto na linha da tabela, bem visivel.

### Alterações

#### 1. Tabela `comunicacoes_divida` — novos campos

A tabela já tem `numero_processo`, `tribunal`, `valor_credito`, `valor_divida`. Faltam `vara` e `estado (uf)`. Criar migração adicionando:
- `vara text` — vara do processo
- `uf text` — estado (UF)

#### 2. `src/pages/Acompanhamento.tsx` — Reestruturar tabela e sheet

**Tabela principal** — Novas colunas:
| Nome | CPF/CNPJ | Processo | Valor | Vara | Estado | Ações |

- Nome e CPF/CNPJ vêm do acompanhamento (pessoa)
- Processo, Valor, Vara, Estado: mostrar da última dívida registrada (ou "—" se nenhuma)
- Na coluna Ações: botão destacado **"Informar Dívida"** com ícone Gavel, cor primary, visível na linha (não escondido em menu)
- Manter botões ativar/desativar e excluir como icon buttons menores ao lado

**Sheet de detalhe** — Ao clicar na linha:
- Manter dados do devedor no topo (nome, CPF/CNPJ, status)
- Remover seção "Processos Encontrados"
- Listar **Dívidas Registradas** (da tabela `comunicacoes_divida`)
- Botão "Nova Dívida" no topo da lista que abre o ComunicarDividaSheet

#### 3. `src/components/acompanhamento/ComunicarDividaSheet.tsx`

- Adicionar campos **Vara** e **UF (Estado)** no formulário
- Mostrar vara e UF no histórico de comunicações

#### 4. `src/hooks/useComunicacoesDivida.ts`

- Sem mudanças estruturais, apenas o input do mutation aceita `vara` e `uf`

#### 5. `src/hooks/useAcompanhamentos.ts`

- Na query de `useAcompanhamentos`, fazer join com `comunicacoes_divida` para trazer a última dívida de cada acompanhamento (para popular as colunas da tabela). Alternativa: buscar separadamente e fazer merge no componente.

### Arquivos

| Arquivo | Ação |
|---|---|
| Migração SQL | Adicionar `vara` e `uf` em `comunicacoes_divida` |
| `src/pages/Acompanhamento.tsx` | Reestruturar colunas da tabela, botão "Informar Dívida" na linha, sheet mostra dívidas |
| `src/components/acompanhamento/ComunicarDividaSheet.tsx` | Adicionar campos vara e UF |
| `src/hooks/useComunicacoesDivida.ts` | Aceitar vara/uf no mutation |
| `src/hooks/useAcompanhamentos.ts` | Buscar última dívida para cada acompanhamento |

