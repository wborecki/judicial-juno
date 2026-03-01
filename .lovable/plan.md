

## Plano: Completar dados do processo no card + remover summary cells

### Problema
1. Faltam campos no card principal: **assunto** (não existe no banco — precisa criar coluna), vara/comarca já aparece mas pode estar vazio, e não há campo dedicado para "assunto" separado de `classe_fase`.
2. Os summary cells "Triagem", "Risco" e "Negócio" devem ser removidos — ficam apenas **Valor Estimado**, **Último Movimento** e **Prazos**.

### O que muda

**1. Banco de dados — nova coluna `assunto`**
- Adicionar coluna `assunto TEXT` na tabela `processos` (nullable)
- Atualizar o processo `0004567-89.2024.8.16.0001` com um assunto fake (ex: "Aposentadoria por Tempo de Contribuição")

**2. ProcessoHeader.tsx — Row 2 expandido**
- Na linha de detalhes (vara, datas), adicionar:
  - **Assunto** (novo campo)
  - **Vara/Comarca** (já existe, manter)
  - Datas de captação e distribuição (já existem)
- Remover triagem_data e precificacao_data do Row 2 (são infos de pipeline, não do processo em si)

**3. ProcessoHeader.tsx — Summary cells**
- Remover as 3 cells: **Triagem**, **Risco**, **Negócio**
- Manter apenas: **Valor Estimado**, **Último Movimento**, **Prazos** (3 cells em vez de 6)
- Remover imports/variáveis não utilizados (`Shield`, `TrendingUp`, `Briefcase` do summary, cálculos de risco/negócio)

**4. Hook useProcessos.ts**
- Garantir que o campo `assunto` seja incluído no tipo `Processo` (types.ts auto-gerado cuida disso após migration)

### Resultado
Card principal com: CNJ, badges (tribunal, natureza, tipo pagamento, classe/fase, status, trânsito), valor estimado, botões de ação, linha com assunto + vara + datas, partes com hierarquia, e 3 summary cells limpos (valor, último movimento, prazos).

