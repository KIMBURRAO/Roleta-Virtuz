# Roleta Virtuz

Aplicação web touch-first para roletas promocionais em eventos Virtuz. A rota `/` é a experiência pública; `/admin` concentra prêmios, estoque, aparência, configurações e histórico.

O banco começa sem prêmios. Os brindes reais são cadastrados pelo painel.

## Requisitos

- Node.js 22 ou mais recente
- pnpm 11 ou mais recente
- um projeto Supabase
- Docker somente se quiser executar o Supabase local e os testes pgTAP

## 1. Instalação

```bash
pnpm install
cp .env.example .env
```

No Windows PowerShell, copie o arquivo com:

```powershell
Copy-Item .env.example .env
```

Preencha no `.env` a URL e a publishable key encontradas em **Supabase > Project Settings > API**. A aplicação aceita a `anon key` legada por compatibilidade, mas nunca use `service_role` no frontend.

## 2. Preparar o Supabase

Autentique e vincule o projeto:

```bash
pnpm dlx supabase@latest login
pnpm dlx supabase@latest link --project-ref SEU_PROJECT_REF
pnpm dlx supabase@latest db push
```

A migration cria:

- `prizes`, `spins`, `app_settings`, `event_sessions` e `stock_adjustments`;
- bucket público de leitura `virtuz-assets`;
- RLS e grants mínimos;
- função atômica `spin_wheel`;
- funções de reposição, novo evento e reconciliação offline;
- Realtime para prêmios e aparência.

### Criar o primeiro administrador

1. Abra **Authentication > Users** no painel Supabase.
2. Crie um usuário com e-mail e senha.
3. Na área de metadados desse usuário, defina o **App Metadata** como:

```json
{ "role": "admin" }
```

Use **App Metadata**, não User Metadata. As políticas RLS verificam o papel assinado no token e rejeitam qualquer conta que não seja administradora. Depois de alterar o papel, saia e entre novamente para renovar o token.

## 3. Executar

```bash
pnpm dev
```

Abra:

- `http://localhost:5173/` — roleta pública;
- `http://localhost:5173/admin` — painel administrativo.

Sem `.env`, a aplicação ainda abre e mostra o estado inicial, mas o painel pede a conexão com o Supabase e não permite persistir dados.

## 4. Uso no evento

1. Cadastre os prêmios reais em **Admin > Prêmios**.
2. Ajuste identidade e textos em **Aparência**.
3. Revise confete, som, imagens, nomes, estoque, pesos e fullscreen em **Configurações**.
4. Abra `/` no tablet e use o botão discreto de tela cheia.

O sorteio online é decidido no banco e a baixa de estoque ocorre na mesma transação. O navegador recebe o resultado confirmado e só então anima a roda até a fatia correta. Isso impede dois dispositivos online de entregar a mesma última unidade.

### Conexão instável

O PWA armazena o shell, as imagens já vistas, a aparência e a lista recente de prêmios.

- Com controle de estoque ligado, a roleta continua visível offline, mas o giro pausa para não prometer um estoque que não pode ser reservado sem conexão.
- Com controle de estoque desligado, giros offline são permitidos, ficam em uma fila idempotente e são registrados quando a conexão volta.
- Um indicador pequeno mostra **Modo offline** sem substituir a tela por um erro técnico.

Essa escolha preserva a confiabilidade do prêmio entregue. A garantia de concorrência do estoque só existe quando o banco está acessível.

## 5. Qualidade

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Para validar migration, RLS e RPC em um ambiente Supabase local com Docker:

```bash
pnpm dlx supabase@latest start
pnpm dlx supabase@latest db reset
pnpm dlx supabase@latest test db
```

Os testes de frontend cobrem sorteio uniforme e ponderado, elegibilidade, último prêmio, pesos inválidos, trava contra giro duplo, posição final e CSV. `supabase/tests` cobre RLS, permissões, baixa da última unidade e idempotência do RPC.

## 6. Build e deploy

```bash
pnpm build
pnpm preview
```

O resultado está em `dist/`. Veja [docs/DEPLOY.md](docs/DEPLOY.md) para Vercel, Netlify e instalação no tablet.

### GitHub Pages

O projeto inclui `.github/workflows/deploy-pages.yml`. Depois de publicar o código em um repositório GitHub com branch `main`, ative **Settings > Pages > Build and deployment > Source: GitHub Actions**.

No repositório, cadastre em **Settings > Secrets and variables > Actions**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Também é aceito `VITE_SUPABASE_ANON_KEY` para projetos que ainda usam a chave legada. O workflow ajusta automaticamente o caminho base para `https://USUARIO.github.io/NOME-DO-REPO/`.

## Estrutura principal

```text
src/
  components/ui/       componentes compartilhados
  features/auth/       sessão e proteção administrativa
  features/prizes/     cadastro e estoque
  features/wheel/      sorteio, roleta e resultado
  pages/admin/         páginas do painel
  pages/public/        tela do evento
  services/            Supabase, Storage e cache offline
  types/               contratos do domínio
supabase/
  migrations/          banco, Storage, RLS e funções
  tests/               testes pgTAP
public/brand/           logos Virtuz fornecidas
```

## Segurança operacional

- Revise regularmente os usuários em Auth; somente `app_metadata.role = admin` acessa o painel.
- Não publique `.env` nem chaves secretas.
- A publishable/anon key é pública por natureza; a proteção real está nos grants, RLS e funções do banco.
- Execute os testes pgTAP e os Advisors do Supabase antes de cada evento importante.
