

## Plano: Header global com pesquisa, notificações e perfil do usuário

### Resumo
Criar um componente `AppHeader` fixo no topo da área de conteúdo, contendo: barra de pesquisa global, ícone de notificações (com link para `/configuracoes/notificacoes`), botão de configurações e avatar/menu do usuário com opção de sair. Remover a seção de usuário do rodapé da sidebar.

### 1. Novo componente `AppHeader.tsx`

Layout horizontal com altura fixa (~56px), border-bottom, contendo:
- **Esquerda**: Barra de pesquisa com ícone `Search` — busca global por processos, negócios, pessoas (navegação por resultados)
- **Direita**: 
  - Ícone `Bell` (notificações) — link para `/configuracoes/notificacoes`
  - Ícone `Settings` — link para `/configuracoes`
  - Avatar do usuário (iniciais) com `DropdownMenu`: nome, email, link "Configurações", separador, "Sair"

### 2. Atualizar `AppLayout.tsx`

Adicionar `AppHeader` acima do `<Outlet />`, dentro da `<main>`:

```text
┌──────────┬──────────────────────────────┐
│          │  [Search...]   🔔  ⚙  [AV] │  ← AppHeader
│ Sidebar  ├──────────────────────────────┤
│          │                              │
│          │       <Outlet />             │
│          │                              │
└──────────┴──────────────────────────────┘
```

### 3. Atualizar `CrmSidebar.tsx`

Remover toda a seção de usuário do rodapé (linhas 112-146) — agora fica no header.

### 4. Pesquisa global (CommandDialog)

Usar o componente `CommandDialog` (cmdk) já disponível no projeto para a busca:
- Ao clicar na barra de pesquisa ou pressionar `Ctrl+K`, abre um modal de comando
- Grupos: Processos, Negócios, Pessoas, Páginas
- Selecionar um resultado navega para a página correspondente
- Busca local nas rotas + dados carregados (sem backend adicional por agora)

### Arquivos impactados

| Arquivo | Ação |
|---|---|
| `src/components/AppHeader.tsx` | Novo — header com search, notificações, settings, avatar |
| `src/components/AppLayout.tsx` | Adicionar AppHeader no layout |
| `src/components/CrmSidebar.tsx` | Remover seção de usuário do rodapé |

