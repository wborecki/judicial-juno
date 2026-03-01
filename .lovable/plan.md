

## Plano: Layout 2 colunas — Dados Básicos (esquerda) + Partes/Movimentações/Accordions (direita)

### Layout

```text
┌──────────────────────────────────┬──────────────────────────────────┐
│  COLUNA ESQUERDA (50%)           │  COLUNA DIREITA (50%)            │
│                                  │                                  │
│  ┌────────────────────────────┐  │  ┌────────────────────────────┐  │
│  │ CNJ + copiar + link ext.  │  │  │ Accordion: Partes          │  │
│  │ Badges (tribunal, nat...) │  │  │ Accordion: Movimentações   │  │
│  │ Valor da Causa + Triagem  │  │  │ Accordion: Documentos      │  │
│  │ Botões (Converter etc.)   │  │  │ Accordion: Financeiro      │  │
│  ├────────────────────────────┤  │  │ Accordion: Relacionados    │  │
│  │ Grid campos (2 colunas):  │  │  │ Accordion: Notas Internas  │  │
│  │  Classe Judicial           │  │  └────────────────────────────┘  │
│  │  Assunto                   │  │                                  │
│  │  Órgão Julgador            │  │                                  │
│  │  Vara / Comarca            │  │                                  │
│  │  Área                      │  │                                  │
│  │  Foro                      │  │                                  │
│  │  Juiz                      │  │                                  │
│  │  Competência               │  │                                  │
│  │  Autuação                  │  │                                  │
│  │  Distribuição              │  │                                  │
│  │  Observações               │  │                                  │
│  └────────────────────────────┘  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

### O que muda

**1. ProcessoDetalhe.tsx — layout 2 colunas**
- Trocar `space-y-4 max-w-6xl` para `grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl`
- Coluna esquerda: `ProcessoHeader` (só dados básicos, sem partes, sem summary footer)
- Coluna direita: card com todos os Accordions (Partes, Movimentações, Documentos, Financeiro, Relacionados, Notas) — com `sticky top-4` para acompanhar scroll
- Botão "Voltar" fica acima do grid, full width

**2. ProcessoHeader.tsx — simplificar**
- Remover a seção de Partes (PartesBlock) — vai para o accordion na coluna direita
- Remover o Summary Footer (Row 3 com Valor/Último Mov/Prazos) — informação já está nos campos e accordions
- Manter: CNJ + badges + valor da causa + triagem + botões de ação + grid de campos detalhados (classe, assunto, órgão, vara, área, foro, juiz, competência, datas) + observações
- Grid de campos passa de 3 para 2 colunas (coluna mais estreita agora)
- O card fica com `sticky top-4` também, para o conteúdo da esquerda acompanhar

**3. Sem mudanças no banco** — apenas reorganização visual

### Resultado
Página dividida em 2 colunas: esquerda com todos os dados estáticos/básicos do processo num card limpo, direita com toda a informação relacional (partes, movimentações, documentos, etc.) em accordions.

