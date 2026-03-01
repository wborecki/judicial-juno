

## Plano: Layout single-column estilo Pipedrive

### O que muda

O layout atual com 2 colunas lado a lado vai ser substituído por uma **coluna única full-width** com tudo empilhado verticalmente, igual ao Pipedrive:

```text
┌─────────────────────────────────────────────────────┐
│  ← Voltar                                           │
├─────────────────────────────────────────────────────┤
│  CNJ 1061202-29.2024.4.01.3500  [copiar] [ext]     │
│  [TRF-1] [Precatório] [S3] [Apto]                  │
│  Valor da Causa: R$ 112.983,59  [Converter] [⋮]    │
├─────────────────────────────────────────────────────┤
│  Classe Judicial      Assunto         Órgão Julg.   │
│  Vara / Comarca       Área            Foro          │
│  Juiz                 Competência     Autuação      │
│  Distribuição         Observações                   │
╞═════════════════════════════════════════════════════╡
│ [Partes] [Movimentações] [Documentos] [Financeiro] │
│ [Relacionados] [Anotações]                          │
├─────────────────────────────────────────────────────┤
│  Conteúdo da aba selecionada (full width)           │
└─────────────────────────────────────────────────────┘
```

### Mudanças

**1. ProcessoDetalhe.tsx**
- Remover o `grid-cols-2`. Tudo em `space-y-4 max-w-7xl`, uma coluna vertical
- `ProcessoHeader` no topo (full width)
- Abaixo: substituir os Accordions por **Tabs horizontais** (Shadcn Tabs) com ícones:
  - Partes, Movimentações, Documentos, Financeiro, Relacionados, Anotações
- Cada tab renderiza conteúdo full-width

**2. ProcessoHeader.tsx**
- Grid de campos detalhados passa de 2 para **3 colunas** (mais espaço horizontal agora)
- Tudo mais fica igual (CNJ, badges, valor, botões)

**3. Sem mudanças no banco** — apenas reorganização visual

