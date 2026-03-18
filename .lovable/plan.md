

## Plano: Campos com Fórmulas Calculadas

### Conceito

Novo tipo de campo "Fórmula" nos campos personalizados. O administrador escreve uma expressão matemática que referencia outros campos, e o valor é calculado automaticamente em tempo real no cliente. Campo somente leitura, sem persistência (calculado on-the-fly).

### Sintaxe das Fórmulas

Referências entre chaves `{}`, suportando campos personalizados e campos fixos do processo:

```text
Exemplos:
  {Valor da Causa} * 0.7
  {Valor Precificado} / {Valor da Causa} * 100
  ROUND({Valor da Causa} * 0.15, 2)
  IF({Score Risco} > 80, {Valor da Causa} * 0.5, {Valor da Causa} * 0.3)
  MIN({Campo A}, {Campo B})
  MAX({Valor da Causa}, {Valor Precificado})
```

**Campos fixos disponíveis:** `valor_estimado`, `valor_precificado`

**Funções suportadas:** `ROUND(valor, casas)`, `IF(condição, se_verdade, se_falso)`, `MIN(a, b)`, `MAX(a, b)`, `ABS(valor)`, `PERCENT(parte, total)`

### Arquitetura (Performance-first)

```text
┌─────────────────────────────────────┐
│  campos_analise (DB)                │
│  tipo = "formula"                   │
│  formula = "{Valor} * 0.7"          │
│  formato_formula = "moeda" | "numero" | "percentual"  │
└──────────────┬──────────────────────┘
               │ carrega uma vez
               ▼
┌─────────────────────────────────────┐
│  FormulaEngine (client-side)        │
│  - Parse: tokeniza a expressão      │
│  - Resolve: substitui {} por valores│
│  - Evaluate: calcula com sandbox    │
│  - Cache: memoiza resultados        │
└──────────────┬──────────────────────┘
               │ recalcula só quando
               │ dependências mudam
               ▼
┌─────────────────────────────────────┐
│  UI: campo read-only com resultado  │
│  - Ícone de fórmula (fx)           │
│  - Tooltip mostra a expressão       │
│  - Formatação automática (R$, %)    │
└─────────────────────────────────────┘
```

**Sem persistência**: fórmulas são calculadas no cliente a partir dos valores já carregados. Zero queries extras.

**Detecção de ciclos**: ao salvar a fórmula, o sistema verifica se há referências circulares (A→B→A) e bloqueia.

**Avaliação segura**: parser próprio com AST simples, sem `eval()`. Suporta apenas operações numéricas e funções permitidas.

### Alterações

1. **Migração SQL** -- Adicionar coluna `formula text` e `formato_formula text default 'numero'` na tabela `campos_analise`

2. **`src/lib/formula-engine.ts`** (novo) -- Motor de fórmulas:
   - `parseFormula(expr)` → tokeniza e gera AST
   - `resolveReferences(ast, valoresMap)` → substitui referências por valores
   - `evaluate(ast)` → calcula o resultado
   - `detectCycles(campos)` → verifica dependências circulares
   - `extractDependencies(expr)` → lista campos referenciados
   - Funções: ROUND, IF, MIN, MAX, ABS, PERCENT

3. **`src/pages/CamposAnalise.tsx`** -- Adicionar tipo "Fórmula (fx)" no select de tipos. Quando selecionado, mostrar:
   - Textarea para a expressão da fórmula
   - Select de formato de saída (Número, Moeda R$, Percentual %)
   - Lista de campos disponíveis para referência (clicável para inserir)
   - Validação em tempo real da expressão + check de ciclos

4. **`src/components/processo/TabAnalise.tsx`** e **`src/components/negocios/TabCamposPersonalizados.tsx`** -- Para campos tipo "formula":
   - Renderizar como campo read-only com ícone `fx`
   - Calcular valor usando FormulaEngine com os valores atuais
   - Recalcular via `useMemo` quando qualquer valor dependente muda
   - Tooltip mostrando a expressão original
   - Formatação automática baseada em `formato_formula`

5. **`src/hooks/useCamposAnalise.ts`** -- Adicionar `formula` e `formato_formula` ao tipo `CampoAnalise`

### Segurança da Avaliação

O engine NÃO usa `eval()` ou `new Function()`. Implementa um parser recursivo descendente que só aceita:
- Literais numéricos
- Referências `{nome}`
- Operadores: `+`, `-`, `*`, `/`, `>`, `<`, `>=`, `<=`, `==`
- Funções da whitelist: ROUND, IF, MIN, MAX, ABS, PERCENT
- Parênteses para agrupamento

Qualquer token não reconhecido retorna erro, impossibilitando injeção de código.

