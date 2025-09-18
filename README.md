# LeMaShows – Versão Unificada Simples

Este repositório agora possui uma versão simplificada (HTML/JS direto) que roda toda a aplicação usando apenas **`index.html`**. A antiga separação (`auth.html`, `app.html`) foi removida.

> Se você quiser continuar usando a versão React/Vite que existe em `src/`, consulte a seção "Modo React (opcional)" abaixo. A versão simples não depende dela.

---

## Como Rodar (Modo Simples – Recomendado)

Opções:

### 1. Abrir diretamente
Abra o arquivo `index.html` no navegador. (Para Supabase funcionar 100%, alguns navegadores exigem servir via HTTP; se tiver erro de CORS use a opção 2.)

### 2. Servir com um servidor estático rápido
```sh
npm install -g serve
serve .
```
Ou:
```sh
npx http-server .
```
Acesse a URL indicada (geralmente http://localhost:3000 ou 8080).

### Fluxo
- Sem sessão: aparece tela de Login / Criar Conta.
- Após login válido: Dashboard é exibido (sidebar + páginas dinâmicas).
- Logout retorna para a tela de login.

---

## Estrutura Principal (Modo Simples)
- `index.html` – único ponto de entrada.
- `js/supabase.js` – inicializa cliente Supabase em `window.supabase` (alias `window.sb`).
- `js/main.js` – decide entre tela de login e app.
- `js/app.js` – lógica de navegação interna (dashboard, calendário, usuários, relatórios).
- `js/utils.js` – utilitários (toast, loading, formatação, etc.).
- `js/components/*.js` – render e init de cada página.
- `css/styles.css` – estilos globais e componentes.

---

## Modo React (Opcional)
O repositório ainda contém uma base criada com Vite + React em `src/`. Caso queira migrar as funcionalidades atuais para React:
1. Restaure um `index.html` padrão do Vite (com `<div id="root"></div>` e `<script type="module" src="/src/main.tsx"></script>`).
2. Transcreva os componentes de `js/components/` para React.
3. Substitua a lógica de auth do `main.js` por hooks (`useEffect`) e contexto.

Enquanto não fizer essa migração, ignore os arquivos em `src/`.

---

## Supabase
- Cliente acessível via `window.supabase` ou `window.sb`.
- Autenticação persiste sessão (localStorage).
- Se quiser trocar a URL / chave, edite `js/supabase.js`.

---

## Scripts Úteis (se quiser usar Node)
Instalar dependências (apenas se for usar algo do setup antigo React):
```sh
npm install
```
Rodar Vite (modo React – só se reativar o index original do Vite):
```sh
npm run dev
```

---

## Limpeza / Manutenção
- Arquivos removidos: `auth.html`, `app.html`, `js/auth.js` (substituídos pela unificação).
- Se criar novos módulos, manter padrão de expor objeto global (`window.NomeModulo`).

---

## Roadmap sugerido
- [ ] Portar páginas para componentes React (se desejar).
- [ ] Adicionar controle de roles no frontend (já parcialmente presente em utils).
- [ ] Implementar paginação e filtros avançados em relatórios.
- [ ] Adicionar testes end-to-end (Playwright ou Cypress) – opcional.

---

## Suporte
Se algo ficar preso em "Carregando":
1. Abra console (F12) e veja erros.
2. Verifique se `window.supabase` existe.
3. Cheque sua chave pública no `js/supabase.js`.
4. Verifique se a tabela `profiles` existe (a inicialização busca esse dado).

---

## Informações Originais (Lovable)
O projeto foi inicialmente criado via Lovable (Vite + React + Tailwind + shadcn-ui). Mantida a referência abaixo:

**URL (Lovable)**: https://lovable.dev/projects/24d2340a-b1e6-41a3-bf6d-b301f3a7ea41

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/24d2340a-b1e6-41a3-bf6d-b301f3a7ea41) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tecnologias (Modo Simples Atual)
- HTML / CSS / JS vanilla
- Tailwind (classes utilitárias já processadas no CSS caso esteja usando build anterior)
- Supabase (auth + dados)

## Tecnologias (Modo React Opcional)
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deploy (Simples)
Basta publicar o conteúdo estático (GitHub Pages, Vercel, Netlify, etc.). Certifique-se de expor somente a chave pública do Supabase (já é a anon key).

## Domínio Customizado
Se usar Vercel/Netlify, adicione o domínio no painel deles. Para Lovable siga a docs original se optar pelo fluxo React hospedado lá.
