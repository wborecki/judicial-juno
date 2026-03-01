

## Plan: Improve Partes UI + Add More Parties

### 1. Insert additional parties into the database

Add to process `10000001-0000-4000-b000-000000000004`:
- **More authors**: "Maria Aparecida Souza" (co-author, wife/family member)
- **Outros**: "Dr. Paulo Henrique Lima" (perito judicial), "Ana Clara Rodrigues" (assistente técnico/auditor)

SQL migration to insert these records.

### 2. Redesign TabPartes UI

Redesign following the reference image style:
- **3-column grid**: Autor | Reu | Outros — always shown even if empty
- **White cards** with subtle border (bg-card/bg-white instead of bg-muted/30)
- **Hierarchical layout**: Main parties listed first with bold names, then a separator line with "ADVOGADO(S)" label and indented lawyer entries below
- CPF/CNPJ in monospace font below each name
- OAB info inline with CPF for lawyers
- Badge count in the header showing total per polo
- Clean header with icon + uppercase label matching the reference screenshot style

### Technical details

**Database**: Single INSERT statement adding 2-3 new `processo_partes` rows with tipos: `autor`, `perito`, `assistente_tecnico` (mapped to "outros" group).

**TabPartes.tsx changes**:
- Card styling: `bg-card border border-border/60 rounded-xl p-5 shadow-sm` (white cards)
- Always render all 3 columns, showing "Nenhum cadastrado" for empty ones
- Improved PersonRow with better spacing and visual hierarchy
- Handle new tipos (`perito`, `assistente_tecnico`, etc.) in the "outros" group via default switch case (already works)

