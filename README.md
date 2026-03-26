# Judicial Juno

Sistema de gestão judicial com CRM, triagem, acompanhamento processual e módulo comercial.

## Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build & dev server)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (auth, banco de dados, storage)
- **TanStack React Query** (gerenciamento de estado server-side)
- **Tiptap** (editor rich text)
- **Recharts** (gráficos e dashboards)

## Desenvolvimento local

```sh
# Clonar o repositório
git clone https://github.com/Solutions-in-BI/judicial-juno.git
cd judicial-juno

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:8080`.

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação de lint |
| `npm run test` | Executar testes |

## Deploy

O projeto faz deploy automático na **Vercel** a cada push na branch `main`.
