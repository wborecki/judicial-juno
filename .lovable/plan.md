

## Plano: Polish de UX/UI no Sistema

Vou aplicar melhorias visuais e de consistencia em diversas areas do sistema, focando em detalhes que elevam a qualidade percebida.

---

### 1. NegocioDetalhe - Header refinado

**Problemas atuais:**
- Input de edicao do titulo mostra borda completa, parece um campo de formulario solto
- Tabs usam o estilo padrao (fundo cinza pill) enquanto ProcessoDetalhe usa tabs com underline e icones - inconsistente
- Valor da proposta solto no canto sem label

**Ajustes:**
- Input de edicao: borda transparente, so aparece ao focar (estilo inline edit limpo)
- Tabs: mesma estilo do ProcessoDetalhe (underline, com contadores, sem fundo cinza)
- Valor com label "Valor Proposta" acima, alinhado a direita como no ProcessoHeader

### 2. NegocioListTable - Padronizar com tabela de Processos

**Problemas atuais:**
- Cores hardcoded (`bg-blue-100`, `bg-green-100`, `bg-red-100`) fora do design system
- Sem zebra-striping, sem hover consistente
- Headers sem uppercase/tracking padrao

**Ajustes:**
- Trocar cores por tokens (`bg-primary/10 text-primary`, `bg-success/10 text-success`, `bg-destructive/10 text-destructive`)
- Aplicar mesmo padrao de header da tabela de Processos (text-[11px] uppercase tracking-wider)
- Hover e transicoes consistentes

### 3. TabDadosGerais - Icones nos headers de secao

**Problemas atuais:**
- Headers de secao sao apenas texto ("Responsavel & Vinculos", "Valores")
- Sem hierarquia visual clara

**Ajustes:**
- Adicionar icones nos headers de secao (User para Responsavel, Briefcase para Informacoes, DollarSign para Valores, MessageSquare para Observacoes)
- Usar gap e flex para alinhar icone + texto

### 4. TabAtividades - Cores do design system

**Problemas atuais:**
- Cores hardcoded (`bg-amber-500/10`, `bg-blue-500/10`, `bg-purple-500/10`, `bg-emerald-500/10`, `bg-cyan-500/10`)

**Ajustes:**
- Substituir por cores do design system (primary, success, warning, info, accent)

### 5. NegocioKanban - Micro-ajustes

- Cards: adicionar sombra sutil no hover (`hover:shadow-md` ja existe, manter)
- Barra de cor no topo: usar cor da etapa em vez de primary fixo (o usuario pediu primary no Kanban, manter)

---

### Arquivos editados

1. `src/pages/NegocioDetalhe.tsx` - Tabs com underline/icones, input inline limpo, valor com label
2. `src/components/negocios/NegocioListTable.tsx` - Cores do design system, headers padronizados, hover
3. `src/components/negocios/TabDadosGerais.tsx` - Icones nos headers de secao
4. `src/components/negocios/TabAtividades.tsx` - Cores do design system

