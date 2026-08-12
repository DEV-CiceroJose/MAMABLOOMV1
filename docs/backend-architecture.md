# Backend MamaBloom

## Decisão arquitetural

O backend usa Node.js, Express e PostgreSQL no mesmo monorepo do React/Vite. A escolha preserva a aplicação existente, permite deploy pelo Blueprint atual do Render e cria uma base multiusuária para os módulos apresentados no pitch.

## Escopo entregue nesta fase

O PDF prioriza apoio à gestação e ao pós-parto, com Diário gestacional, Cartão de emergência, Saúde da mamãe, Agenda e Relatórios. Esses módulos já existem no frontend e agora podem ser sincronizados por conta autenticada.

Fluxo de dados:

1. a usuária cria a conta ou entra por e-mail/CPF;
2. a API cria uma sessão assinada em cookie `HttpOnly`, inacessível ao JavaScript do navegador; em produção, o cookie também usa `Secure` e `SameSite=None` para a comunicação entre o site e a API do Render;
3. o React mantém resposta imediata em um cache local separado por conta;
4. cada alteração é sincronizada com o PostgreSQL;
5. ao entrar em outro dispositivo, a versão persistida é recuperada;
6. se a rede oscilar, a versão local continua disponível e é reenviada quando o navegador volta a ficar online.

## Modelo de dados

### `users`

Armazena identidade, hash da senha e perfil gestacional. CPF e e-mail são únicos. A API nunca devolve hash ou CPF nas respostas de sessão.

### `user_data`

Armazena o JSON de cada módulo por usuária, usando a chave já adotada pelo frontend. A chave composta `(user_id, data_key)` impede colisão entre contas e permite migrar o produto sem reescrever todas as telas de uma vez.

As chaves aceitas são uma lista fechada no servidor; `mamabloom:session` e qualquer chave arbitrária são recusadas.

## Segurança

- senhas com bcrypt e custo configurável;
- JWT assinado e válido por sete dias;
- idade mínima de 16 anos validada no cliente e no servidor;
- consultas PostgreSQL parametrizadas;
- CORS restrito aos domínios configurados;
- headers de segurança pelo Helmet;
- limite de tentativas nas rotas de autenticação;
- corpo JSON limitado a 1 MB;
- banco do Render sem acesso público no Blueprint.

## Render

O `render.yaml` declara:

- a landing e o React como site estático;
- `mamabloom-api` como serviço Node;
- `mamabloom-db` como PostgreSQL;
- segredo JWT gerado pelo Render;
- conexão privada entre API e banco;
- deploy automático a cada commit da `main`.

O plano gratuito do PostgreSQL é apropriado apenas para demonstração: expira após 30 dias e não oferece backups. Antes de usar dados reais de saúde, é obrigatório migrar para um plano persistente com backup e concluir a revisão jurídica/LGPD.

## Próximas normalizações

A estratégia JSON reduz o risco da primeira integração. As próximas fases podem promover módulos para tabelas próprias sem quebrar o contrato atual, nesta ordem:

1. Agenda e notificações;
2. Saúde semanal e relatórios mensais;
3. Diário com upload privado de fotos;
4. Cartão de emergência com compartilhamento controlado;
5. organizações B2G e indicadores anonimizados;
6. loja, pagamentos e planos;
7. IA com revisão clínica e trilhas de auditoria.
