
Objetivo
- Corrigir definitivamente o escurecimento acumulado quando há Sheet/Dialog sobrepostos, mantendo a opacidade padrão constante.

Diagnóstico (causa raiz)
- O CSS atual em `src/index.css` usa seletores com `+` e profundidade fixa (2, 3, 4 portais).
- Quando a ordem dos portais muda (ou há portais intermediários), a regra não pega todos os casos, então overlays extras continuam com `bg-black/80` e a tela escurece progressivamente.
- Além disso, apenas `dialog.tsx` e `sheet.tsx` têm `data-overlay`; `alert-dialog.tsx` e `drawer.tsx` ainda não participam da regra global.

Plano de implementação
1) Padronizar marcação de overlay em todos os componentes base de modal
- Atualizar:
  - `src/components/ui/alert-dialog.tsx`
  - `src/components/ui/drawer.tsx`
- Adicionar `data-overlay=""` no Overlay (igual já existe em `dialog.tsx` e `sheet.tsx`).

2) Substituir regra frágil de stacking no CSS global
- Em `src/index.css`, remover a regra atual com combinações fixas de `+`.
- Adicionar uma regra única, geral, baseada em portais com overlay aberto, para deixar transparente qualquer overlay “depois do primeiro”:
  - foco em `[data-state="open"]`
  - cobertura ilimitada de níveis de sobreposição
  - sem depender de serem irmãos adjacentes.

3) Garantir comportamento consistente
- Manter o primeiro overlay visível (escurecimento padrão).
- Overlays subsequentes ficam transparentes (não acumulam preto), mas continuam bloqueando interação indevida do fundo.

Validação (end-to-end)
- Fluxo principal em `/acompanhamento`:
  1. Abrir “Detalhe” (Sheet 1),
  2. Abrir “Anexar Dívida” (Sheet 2),
  3. Abrir “Criar Nova Pessoa” (Dialog 3).
  Resultado esperado: opacidade de fundo igual do primeiro nível, sem escurecer mais.
- Fechar em cascata (Dialog → Sheet 2 → Sheet 1): overlay permanece correto em cada etapa.
- Testar outro fluxo com `AlertDialog` sobre `Sheet` (ex.: páginas com exclusão): sem escurecimento acumulado.
- Testar caso simples (apenas 1 modal): visual padrão intacto.

Detalhes técnicos
- Arquivos impactados:
  - `src/index.css` (regra global de overlay stacking)
  - `src/components/ui/alert-dialog.tsx` (`data-overlay`)
  - `src/components/ui/drawer.tsx` (`data-overlay`)
- Não haverá alteração de banco, hooks de dados ou regras de negócio; ajuste é exclusivamente de camada de UI/overlay.
