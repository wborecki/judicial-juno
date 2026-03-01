

## Plano: Kanban estilo Pipedrive para Negócios

Baseado na imagem de referência do Pipedrive, vou redesenhar o Kanban e a toolbar da página de Negócios.

### Mudanças principais

**1. `NegocioKanban.tsx` — Redesign completo**
- Colunas com header mostrando **nome da etapa**, **valor total** (soma dos valores da coluna) e **contagem de negócios** (ex: "R$ 0 · 1539 negócios")
- Barra colorida no topo de cada coluna (cor da etapa)
- Cards mais densos no estilo Pipedrive: título bold (com pessoa + processo), partes (réu/autor truncado), valor, avatar do responsável, ícone de prioridade
- Scroll vertical dentro de cada coluna (altura fixa com overflow)
- Colunas mais estreitas para caber mais na tela

**2. `Negocios.tsx` — Toolbar estilo Pipedrive**
- Toolbar compacta: view toggles (ícones) à esquerda, botão "+ Negócio" verde, contagem total de negócios à direita, seletor de pipeline, filtro
- Remover header grande com ícone/título, substituir por toolbar inline

**3. Cards do Kanban**
- Mostrar: título do negócio (ou nome da pessoa + número do processo)
- Partes envolvidas (réu/autor) truncadas
- Valor formatado em BRL
- Avatar do responsável + ícone de prioridade no rodapé do card

### Arquivos afetados
| Arquivo | Ação |
|---|---|
| `src/components/negocios/NegocioKanban.tsx` | Reescrever — layout Pipedrive |
| `src/pages/Negocios.tsx` | Refatorar toolbar — compacta estilo Pipedrive |

