# MamaBloom: isolamento das áreas e conexão com a API

Revisão de 23/11/2026 na branch `codex/mamabloom-novas-funcionalidades`.

## Comparação com o Render

No workspace `test-devs`, o frontend `mamabloom` e a API `mamabloom-api` ainda publicam o commit `e69cdf2bb765364e4f5ad639ee73e1de186049e1`. Esta revisão está somente na branch de validação. Não houve deploy nem alteração da `main`.

## Áreas por conta

| Conta | Rotas do aplicativo | API de comunidade |
| --- | --- | --- |
| Mãe | Jornada, apoio, psicologia, artigos e demais recursos da paciente | Amizades, empresas, profissionais disponíveis e reserva de consultas |
| Psicóloga | Painel profissional, incluindo edição de nome e foto, cadastro, horários, consultas, chat e Meet | Perfil profissional, horários próprios e consultas em que participa |
| Administrador | Painel administrativo para analisar psicólogos e empresas | Listagem e decisões administrativas |

O frontend consulta `GET /v1/community/me` antes de renderizar uma rota privada. Acesso direto a uma área diferente redireciona para o painel correspondente. Se a verificação falhar, a rota não é renderizada. O menu mostra apenas o painel da conta privilegiada e a saída; a navegação inferior e o atalho de configurações da paciente não aparecem. A psicóloga edita nome e foto dentro do próprio painel.

O backend verifica a área em cada rota de comunidade e bloqueia o armazenamento da jornada (`/v1/data/*`) e a edição da gestação para psicólogas e administradores. O cadastro de psicóloga grava o tipo de conta no servidor antes de iniciar a sessão. Contas profissionais anteriores são reconhecidas pelo perfil já existente. O privilégio de administrador continua sendo concedido somente pelo comando interno no servidor.

## Caminho da conexão

1. O frontend usa `VITE_API_URL`; em produção, `render.yaml` aponta para `https://mamabloom-api.onrender.com`. Em desenvolvimento nesta máquina, o endereço é `http://127.0.0.1:3002`.
2. `app/src/lib/api.js` envia requisições com `credentials: 'include'`. O login em `POST /v1/auth/login` recebe um cookie de sessão HttpOnly. Em produção, ele usa `Secure` e `SameSite=None` para o frontend e a API em origens distintas.
3. O backend confere o JWT e carrega a conta em toda rota protegida. `GET /v1/community/me` fornece a área atual. As páginas de psicologia usam `/professionals`, `/slots`, `/consultations` e `/consultations/:id/messages`; o administrador usa `/admin`.
4. O serviço da API no Render usa PostgreSQL por `DATABASE_URL` e o schema configurado. A demonstração local usa JSON separado, com contas fictícias. A conexão real ao PostgreSQL de produção e um agendamento real via Google Meet não foram testados nesta rodada.

Os testes de API cobrem cadastro profissional, autorização de rotas, isolamento de dados, reserva e chat em JSON e PostgreSQL simulado. O navegador local confirmou login profissional e administrativo, menus restritos, redirecionamento de endereços diretos e o novo desenho dos atalhos da paciente.

## Limites existentes

- O link do Meet continua sendo informado manualmente pelo profissional. O sistema não cria reuniões no Google.
- As páginas de login e cadastro são públicas. A restrição por área vale para as páginas autenticadas e para os endpoints protegidos.
- A mudança não está publicada; deve ser validada no PR antes de integrar na `main`.
