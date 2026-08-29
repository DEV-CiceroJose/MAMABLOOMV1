# MamaBloom API

API Node.js/Express responsável por autenticação e persistência dos dados do aplicativo. O armazenamento pode usar PostgreSQL ou, temporariamente, um arquivo JSON.

## Recursos

- cadastro para pessoas com 16 anos ou mais;
- login por e-mail ou CPF;
- senhas protegidas com bcrypt;
- sessões JWT com duração de sete dias;
- perfil gestacional;
- dados isolados por usuária para Agenda, Diário, Saúde, Emergência, Relatórios e demais módulos existentes;
- CORS restrito, headers de segurança, limite de requisições e payload máximo de 1 MB.

## Executar localmente com PostgreSQL

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

## Executar temporariamente com JSON

Use `DATA_STORE=json` e defina `DATA_FILE_PATH` para um caminho gravável. Nesse modo, não é necessário configurar `DATABASE_URL`:

```bash
DATA_STORE=json DATA_FILE_PATH=./data/mamabloom.json JWT_SECRET=troque-por-uma-chave-com-pelo-menos-32-caracteres pnpm --dir api start
```

O arquivo mantém senhas somente como hashes e preserva o isolamento dos módulos por usuária. No Render gratuito, o sistema usa `/tmp/mamabloom/mamabloom.json`; esse armazenamento é efêmero e pode ser apagado em reinícios, novos deploys ou manutenção da plataforma. Portanto, ele serve apenas para demonstração e testes sem dados reais.

## Ativar PostgreSQL futuramente

O código já está preparado para a troca sem alterações no frontend ou nas rotas:

1. crie o banco PostgreSQL dedicado;
2. configure `DATA_STORE=postgres` e `DATABASE_URL` no serviço da API;
3. reinicie o serviço — as tabelas serão criadas automaticamente.

O arquivo `render.postgres.yaml` contém o Blueprint completo para essa ativação. Dados temporários do JSON não são migrados automaticamente para o PostgreSQL.

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
