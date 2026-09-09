# Deploy e instalação no tablet

## Vercel

1. Importe o repositório na Vercel.
2. Selecione **Vite** como framework.
3. Use `pnpm build` e diretório de saída `dist`.
4. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nas variáveis do projeto.
5. Publique. O `vercel.json` já redireciona rotas da SPA para `index.html`.

## Netlify

1. Importe o repositório.
2. Use `pnpm build` e diretório de publicação `dist`.
3. Cadastre as duas variáveis `VITE_SUPABASE_*`.
4. Publique. `public/_redirects` mantém `/admin` funcionando ao atualizar a página.

## GitHub Pages

1. Publique o projeto em um repositório GitHub usando a branch `main`.
2. Em **Settings > Secrets and variables > Actions**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Em **Settings > Pages**, escolha **GitHub Actions** como origem do deploy.
4. Faça push na branch `main`. O workflow `.github/workflows/deploy-pages.yml` executa testes, lint, typecheck, build e publica `dist`.

O workflow define `VITE_BASE_PATH` automaticamente como `/NOME-DO-REPO/`, então a aplicação funciona em URLs do tipo `https://USUARIO.github.io/NOME-DO-REPO/`.

## Depois do deploy

- Confirme `/` e `/admin`.
- Faça login como administrador.
- Cadastre um prêmio real de teste, gire, confirme a baixa do estoque e exclua o cadastro/histórico de teste antes do evento.
- Confirme o funcionamento da exportação CSV.
- Ative o modo avião depois que a tela e as imagens carregarem para verificar o fallback offline esperado.

## Instalar como PWA

### Android / Chrome

1. Abra a URL da roleta.
2. Menu do navegador > **Adicionar à tela inicial** ou **Instalar app**.
3. Abra pelo ícone Virtuz e permita tela cheia quando solicitado.

### iPad / Safari

1. Abra a URL da roleta.
2. Compartilhar > **Adicionar à Tela de Início**.
3. Abra pelo novo ícone.

Antes de receber participantes, mantenha a página aberta por alguns segundos com internet para preencher o cache. O cache melhora a abertura e preserva assets; não substitui a conexão necessária para reservar estoque compartilhado.
