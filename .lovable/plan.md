

## Plano: Reformular status de triagem dos processos — ✅ CONCLUÍDO

### Novo modelo de status

| Valor BD | Label | Cor | Significado |
|---|---|---|---|
| `pendente` | Pendente | warning/amarelo | Processo captado, aguardando análise |
| `em_acompanhamento` | Em Acompanhamento | info/azul | Analista monitorando, ainda não decidiu |
| `convertido` | Convertido | success/verde | Negócio criado a partir deste processo |
| `descartado` | Descartado | destructive/vermelho | Processo descartado |

### Lógica de transição
- **Criar Negócio** → `triagem_resultado = "convertido"`
- **Acompanhar** → `triagem_resultado = "em_acompanhamento"`
- **Remover Acompanhamento** → `triagem_resultado = "pendente"`
- **Descartar** → `triagem_resultado = "descartado"`
