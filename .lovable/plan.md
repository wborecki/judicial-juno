
## Problema

Existem **duas barras de rolagem sobrepostas** porque a cadeia de containers cria scroll duplicado:

```text
AppLayout
 └─ <main overflow-y-auto>          ← scroll 1
     └─ ConfiguracoesLayout
         └─ <div overflow-y-auto>   ← scroll 2 (conteúdo)
```

O `main` rola o conteúdo inteiro, e dentro dele o `ConfiguracoesLayout` também rola. O mesmo padrão se repete na página de Chat e em Processos, que gerenciam seu próprio scroll interno.

## Solução

Aplicar uma regra simples: **páginas que gerenciam seu próprio layout (configurações, chat, processos, análise) devem receber `overflow-hidden` no `main`, delegando o scroll para o filho.** Páginas simples continuam usando o scroll do `main`.

### Alterações

1. **`AppLayout.tsx`** — Quando a rota é full-width (`/configuracoes`, `/chat`), usar `overflow-hidden` no `main` em vez de `overflow-y-auto`, para que o filho controle o scroll:
   ```tsx
   <main className={cn("flex-1", isFullWidth ? "overflow-hidden" : "overflow-y-auto")}>
   ```

2. **`ConfiguracoesLayout.tsx`** — Trocar `min-h-screen` por `h-full` no container raiz (ele já está dentro de um flex que define a altura). A sidebar interna e o conteúdo mantêm `overflow-y-auto` individual:
   ```tsx
   <div className="flex h-full">
   ```

3. **`Processos.tsx`** — Já usa `h-full overflow-hidden` no container, mas precisa que o `main` pai não adicione scroll. Será coberto pela mudança no `AppLayout` adicionando `/processos` à lista de rotas full-width.

4. **`AppLayout.tsx`** — Expandir a lógica de `isFullWidth` para incluir as rotas que gerenciam scroll próprio:
   ```tsx
   const isFullWidth = 
     location.pathname.startsWith("/configuracoes") || 
     location.pathname === "/chat" ||
     location.pathname === "/processos" ||
     location.pathname.startsWith("/processos/");
   ```

5. **Revisão das demais páginas** — Verificar `Analise.tsx`, `Negocios.tsx`, `Distribuicao.tsx` e outras listagens para garantir que sigam o mesmo padrão sem scroll duplo.
