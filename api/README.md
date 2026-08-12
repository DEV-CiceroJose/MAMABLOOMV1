# MamaBloom API

API Node.js/Express responsável por autenticação e persistência dos dados do aplicativo em PostgreSQL.

## Recursos

- cadastro para pessoas com 16 anos ou mais;
- login por e-mail ou CPF;
- senhas protegidas com bcrypt;
- sessões JWT com duração de sete dias;
- perfil gestacional;
- dados isolados por usuária para Agenda, Diário, Saúde, Emergência, Relatórios e demais módulos existentes;
- CORS restrito, headers de segurança, limite de requisições e payload máximo de 1 MB.

## Executar localmente

1. Inicie o PostgreSQL:

   ```bash
   docker compose up -d database
   ```

2. Crie o arquivo `api/.env` usando `api/.env.example` como referência.

3. Carregue as variáveis e execute:

   ```bash
   pnpm --dir api dev
   ```

A API usa a porta `3001` por padrão e cria as tabelas idempotentes ao iniciar.

## Rotas

| Método | Rota | Autenticação | Uso |
| --- | --- | --- | --- |
| GET | `/health` | Não | Saúde do serviço |
| POST | `/v1/auth/register` | Não | Cadastro e criação da sessão |
| POST | `/v1/auth/login` | Não | Login por e-mail ou CPF |
| GET | `/v1/auth/me` | Cookie HttpOnly | Validação da sessão |
| POST | `/v1/auth/logout` | Cookie HttpOnly | Encerramento da sessão |
| PUT | `/v1/auth/pregnancy` | Cookie HttpOnly | Atualização da gestação |
| GET | `/v1/data/:key` | Cookie HttpOnly | Leitura de um módulo |
| PUT | `/v1/data/:key` | Cookie HttpOnly | Persistência de um módulo |

Os erros seguem o formato `{ "error": { "code": "...", "message": "..." } }`.

## Validar

```bash
pnpm --dir api test
```

Os testes usam um repositório em memória e não alteram o banco local.
