

## Plan: Improve TabDocumentos UI

### Changes to `src/components/processo/TabDocumentos.tsx`

Wrap everything in a single white card container (`bg-card border border-border/60 rounded-xl p-5 shadow-sm`) matching Movimentações style, and add pagination.

**Layout improvements:**
- Upload bar inside the card header area (no separate glass-card)
- Document rows with `hover:bg-muted/30` transition, separated by subtle dividers (`border-b border-border/20`)
- Pagination with ← Anterior / Próximo → arrows, 10 items per page

**Visual details:**
- Tipo badge with color coding per document type (matching the reference screenshot colors)
- Larger click area for download button, trash on hover
- Empty state centered inside the card

