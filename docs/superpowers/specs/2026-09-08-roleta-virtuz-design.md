# Roleta Virtuz — Design técnico e funcional

## Objetivo

Entregar uma aplicação web touch-first para eventos presenciais, com uma roleta promocional em `/` e um painel administrativo autenticado em `/admin`, mantendo a experiência pública simples e concentrando configuração, estoque, histórico e aparência na área administrativa.

## Escopo aprovado

- React, TypeScript, Vite, Tailwind CSS, Supabase Database/Auth/Storage e PWA.
- Tela pública sem navegação administrativa, otimizada para tablet e fullscreen.
- Painel responsivo com dashboard, prêmios, aparência, configurações e histórico.
- Nenhum prêmio fictício ou seed de brindes.
- Identidade verde, branca e verde-escura baseada nos arquivos Virtuz fornecidos.
- Sem CRM, leads, pagamentos, ranking, gamificação ou login de participante.

## Arquitetura

A aplicação é uma SPA com React Router. A camada `services` encapsula Supabase, sorteio, upload, cache e exportação. A camada `features` contém domínios autocontidos para roleta, autenticação, prêmios, aparência, configurações e histórico. Componentes visuais compartilhados ficam em `components/ui`.

O Supabase é a fonte de verdade. `prizes`, `spins`, `stock_adjustments`, `event_sessions` e `app_settings` vivem no Postgres com RLS e privilégios mínimos. Imagens são públicas para leitura no bucket `virtuz-assets`, mas apenas usuários autenticados podem gravar, substituir e excluir. O frontend utiliza somente URL e chave publicável/anon; nunca usa `service_role`.

## Fluxo do sorteio

1. O botão trava imediatamente e impede um segundo giro.
2. Online, o cliente chama `spin_wheel()`. A função seleciona somente prêmios ativos e disponíveis, aplica peso quando configurado, trava e atualiza a linha vencedora, registra o giro e devolve um snapshot do resultado.
3. O cliente calcula o ângulo final a partir do `prize_id` devolvido; o resultado nunca é inferido da animação.
4. A roleta executa voltas completas com desaceleração e para no centro da fatia sorteada.
5. O modal de resultado abre, com confete e som leve conforme configuração.
6. “Novo sorteio” fecha o modal, mantendo o ângulo atual.

Quando o controle de estoque estiver desligado, a função não decrementa estoque. Quando o sorteio ponderado estiver desligado, cada prêmio elegível recebe peso efetivo 1. Pesos inválidos são bloqueados no formulário e por constraints no banco.

## Offline e reconciliação

O service worker guarda o shell da aplicação e assets já carregados. IndexedDB guarda a última aparência, configurações, prêmios e uma fila de giros offline. A tela mostra um indicador discreto.

Com controle de estoque ligado, o giro pausa offline porque não é possível reservar uma unidade compartilhada com segurança sem alcançar o banco. Com o controle desligado, um giro offline usa a lista em cache e cria um identificador idempotente; ao reconectar, `record_offline_spin()` registra cada giro uma única vez. Em uso simultâneo online, `spin_wheel()` mantém a garantia atômica.

## Segurança

- RLS habilitada em todas as tabelas expostas.
- `anon` lê somente prêmios ativos, configurações públicas e a sessão atual.
- `authenticated` recebe CRUD administrativo; exclusão de histórico ocorre apenas por RPC protegida.
- Funções `security definer` usam `search_path = ''`, qualificam todas as relações, verificam identidade quando administrativas e têm `EXECUTE` revogado de `PUBLIC` antes dos grants específicos.
- O RPC público de giro não aceita prêmio escolhido pelo cliente.
- O RPC de reconciliação usa UUID idempotente, valida prêmio e estoque e registra conflitos sem criar duplicatas.
- Storage limita tipo e tamanho no cliente; políticas restringem escrita ao bucket e a usuários autenticados.

## Aparência e experiência

A composição pública usa um fundo verde profundo com faixas diagonais discretas de pista, logo Virtuz, tipografia esportiva em caixa alta, uma roleta com aro duplo e ponteiro superior e um CTA largo. Em landscape, roleta e chamada ficam lado a lado; em portrait, empilham. O painel usa superfícies claras e densidade moderada, com navegação compacta no celular.

Configurações de marca são aplicadas por CSS variables. As imagens da roleta usam recorte central sem deformação. Texto das fatias reduz progressivamente conforme a quantidade de itens. Estados vazios e erros usam linguagem não técnica.

## Dados

- `prizes`: cadastro, aparência da fatia, estoque, peso e status.
- `spins`: snapshot do prêmio, estoque após giro, origem online/offline, status de sincronização e sessão.
- `stock_adjustments`: auditoria de reposições e restaurações.
- `event_sessions`: separa eventos sem apagar cadastros.
- `app_settings`: singleton com textos, cores, assets e toggles.

Índices cobrem prêmios elegíveis, histórico por sessão/data/prêmio e chaves estrangeiras. Constraints garantem estoques não negativos, peso positivo e cores hexadecimais.

## Estados e falhas

- Sem cadastro, ativos ou estoque: “Os prêmios estão sendo preparados.”
- Offline: indicador discreto e continuidade por cache; fila é reconciliada ao voltar.
- Falha de configuração: usa cache ou defaults de marca.
- Upload inválido: mantém preview local e mostra ação de correção.
- Sorteio online falhou: tenta offline quando existe cache elegível; caso contrário libera o botão e informa para tentar novamente.
- Sessão expirada: redireciona ao login preservando a rota pretendida.

## Verificação

Vitest cobre seleção comum/ponderada, filtros de elegibilidade, pesos, ângulos, duplo giro, cache e CSV. Testing Library cobre os fluxos críticos de UI. A entrega final exige testes, lint, typecheck e build com saída limpa. A migração inclui pgTAP de RLS/RPC para execução em um ambiente Supabase local.
