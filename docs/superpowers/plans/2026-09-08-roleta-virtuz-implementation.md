# Roleta Virtuz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a Roleta Virtuz completa, executável e segura para uso em tablets de eventos.

**Architecture:** SPA React/Vite organizada por domínios, Supabase como fonte de verdade e IndexedDB como cache/fila offline. A função de banco escolhe o prêmio e atualiza estoque atomicamente; o frontend apenas traduz o resultado confirmado em animação.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Supabase JS, TanStack Query, Framer Motion, canvas-confetti, vite-plugin-pwa, Dexie, Zod, Vitest e Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-08-roleta-virtuz-design.md`

## Global Constraints

- Não cadastrar prêmios fictícios.
- Usar apenas URL e chave publicável/anon do Supabase no navegador.
- Otimizar primeiro para tablet, com touch targets mínimos de 44 px.
- O resultado do banco precede e determina a animação.
- Testes, lint, typecheck e build devem terminar sem erros.

---

### Task 1: Base executável e identidade

**Files:** `package.json`, `vite.config.ts`, `src/main.tsx`, `src/styles/index.css`, `public/brand/*`, `public/manifest.webmanifest`

**Interfaces:** Produz a aplicação React, tokens CSS dinâmicos, roteamento e assets oficiais Virtuz.

- [ ] Criar o scaffold Vite/React/TypeScript e instalar versões fixas das dependências.
- [ ] Copiar as versões de logo fornecidas para `public/brand` com nomes sem espaços.
- [ ] Configurar Tailwind, aliases, ESLint, Vitest e PWA.
- [ ] Criar um smoke test de roteamento e observar a falha antes do shell da aplicação.
- [ ] Implementar o shell mínimo e confirmar o teste.

### Task 2: Tipos, validação e serviços centrais

**Files:** `src/types/domain.ts`, `src/lib/env.ts`, `src/lib/supabase.ts`, `src/lib/query-client.ts`, `src/services/settings/*`, `src/services/cache/*`

**Interfaces:** Produz `Prize`, `SpinResult`, `AppSettings`, schemas Zod, cliente Supabase opcional e repositórios online/cache.

- [ ] Escrever testes falhos para defaults, normalização e cache.
- [ ] Implementar tipos, validação e fallback quando as variáveis Supabase não estiverem configuradas.
- [ ] Implementar IndexedDB para snapshots e fila offline.
- [ ] Rodar os testes e refatorar somente após verde.

### Task 3: Lógica crítica da roleta

**Files:** `src/features/wheel/domain/*`, `src/features/wheel/hooks/*`, `src/features/wheel/components/*`

**Interfaces:** Produz `getEligiblePrizes`, `pickPrize`, `getTargetRotation`, `useSpinController` e `Wheel`.

- [ ] Escrever testes falhos independentes para sorteio uniforme, ponderado, inativos, sem estoque, último prêmio, pesos inválidos e ângulo final.
- [ ] Implementar a lógica mínima e verificar cada ciclo vermelho/verde.
- [ ] Escrever teste de integração falho para bloqueio de giro duplo.
- [ ] Implementar o controlador com trava síncrona e estados `idle`, `requesting`, `spinning`, `result`, `error`.
- [ ] Implementar a roleta SVG responsiva, aro, ponteiro, fatias, imagens recortadas e movimento até o índice retornado.

### Task 4: Tela pública, resultado e fullscreen

**Files:** `src/pages/public/WheelPage.tsx`, `src/features/wheel/components/ResultDialog.tsx`, `src/components/system/*`

**Interfaces:** Consome a roleta e settings; produz `/`, modal, confete/som, indicador offline e fullscreen.

- [ ] Criar testes falhos para estados vazio, sem estoque, erro e resultado.
- [ ] Implementar o primeiro viewport reconhecível com a identidade Virtuz e CTA touch-first.
- [ ] Abrir o primeiro preview após compilação sem erro.
- [ ] Implementar modal, confete, som sutil, novo sorteio e fullscreen condicionado.
- [ ] Validar layouts landscape, portrait e smartphone por CSS responsivo.

### Task 5: Migração Supabase, RLS, Storage e RPCs

**Files:** `supabase/config.toml`, `supabase/migrations/*_initial_schema.sql`, `supabase/tests/roleta_virtuz_rls.test.sql`

**Interfaces:** Produz tabelas, bucket `virtuz-assets`, grants/policies e RPCs `spin_wheel`, `reconcile_offline_spin`, `adjust_prize_stock`, `start_new_event`.

- [ ] Criar a migração pelo CLI quando disponível e definir constraints/índices.
- [ ] Implementar grants mínimos e políticas para `anon` e `authenticated`.
- [ ] Implementar `spin_wheel()` sem aceitar escolha do cliente e com atualização atômica.
- [ ] Implementar reconciliação idempotente e RPCs administrativas com checagem de `auth.uid()`.
- [ ] Adicionar pgTAP que testa permissões públicas, CRUD autenticado e estoque concorrente.
- [ ] Validar SQL localmente se Docker/Supabase local estiver disponível; caso contrário manter o comando documentado.

### Task 6: Autenticação e estrutura administrativa

**Files:** `src/features/auth/*`, `src/layouts/AdminLayout.tsx`, `src/pages/admin/LoginPage.tsx`, `src/pages/admin/DashboardPage.tsx`

**Interfaces:** Produz guard de sessão, login/logout e `/admin` responsivo.

- [ ] Escrever teste falho para redirecionamento sem sessão e retorno após login.
- [ ] Implementar Auth por e-mail/senha com listener de expiração.
- [ ] Criar navegação compacta e dashboard com métricas simples derivadas dos dados reais.
- [ ] Implementar estados de loading, configuração ausente e sessão expirada.

### Task 7: CRUD de prêmios e upload

**Files:** `src/features/prizes/*`, `src/services/storage/*`, `src/pages/admin/PrizesPage.tsx`

**Interfaces:** Produz formulário Zod, preview/compressão de imagem, CRUD, duplicação, ativação, exclusão e reposição.

- [ ] Escrever testes falhos para validações de nome, quantidade, peso, formato e tamanho de imagem.
- [ ] Implementar formulário e compressão para WebP/JPEG com dimensão máxima.
- [ ] Implementar repositório Supabase e mensagens de erro não técnicas.
- [ ] Implementar cards/tabela responsivos e todas as ações solicitadas.
- [ ] Usar `adjust_prize_stock` para reposição e registrar auditoria.

### Task 8: Aparência e configurações

**Files:** `src/features/settings/*`, `src/pages/admin/AppearancePage.tsx`, `src/pages/admin/SettingsPage.tsx`

**Interfaces:** Produz edição do singleton `app_settings`, uploads de logo/fundo, preview e toggles.

- [ ] Escrever testes falhos para aplicação segura de cores e fallback de valores.
- [ ] Implementar variáveis CSS e atualização em tempo real do preview.
- [ ] Implementar uploads de logo/fundo e persistência.
- [ ] Implementar todos os toggles e atualização imediata da tela pública por Realtime/invalidação.

### Task 9: Histórico, CSV e novo evento

**Files:** `src/features/history/*`, `src/pages/admin/HistoryPage.tsx`, `src/utils/csv.ts`

**Interfaces:** Produz filtros hoje/todos/prêmio, exportação e modal de reinicialização.

- [ ] Escrever testes falhos para escaping UTF-8/BOM do CSV e filtros de data.
- [ ] Implementar lista do mais recente, filtros e download CSV.
- [ ] Implementar confirmação forte com as duas opções de novo evento.
- [ ] Chamar `start_new_event` sem apagar cadastros e atualizar caches.

### Task 10: PWA, offline e WebMCP

**Files:** `vite.config.ts`, `src/services/cache/*`, `src/features/offline/*`, `src/lib/webmcp.ts`

**Interfaces:** Produz cache do shell/assets, snapshots IndexedDB, fila idempotente e ferramenta imperativa para iniciar giro quando elegível.

- [ ] Escrever testes falhos para enfileiramento, idempotência local e conflito.
- [ ] Implementar giro offline com estoque local e reconciliação ao evento `online`.
- [ ] Implementar indicador e painel de conflitos sem interromper a experiência pública.
- [ ] Configurar manifest, ícones, installability e cache runtime de imagens Supabase.
- [ ] Expor somente a ação WebMCP necessária para iniciar o giro.

### Task 11: Documentação e verificação final

**Files:** `README.md`, `.env.example`, `docs/DEPLOY.md`

**Interfaces:** Produz instruções de Supabase, execução, build, deploy e instalação no tablet.

- [ ] Documentar criação do projeto Supabase, migrations, primeiro admin, Storage, PWA e deploy Vercel/Netlify.
- [ ] Revisar segurança: RLS, grants, funções, bucket e ausência de `service_role`.
- [ ] Rodar toda a suíte de testes e corrigir falhas.
- [ ] Rodar lint e corrigir falhas.
- [ ] Rodar TypeScript check e corrigir falhas.
- [ ] Rodar build de produção e corrigir falhas.
- [ ] Conferir requisito por requisito e remover placeholders ou dados fictícios.
