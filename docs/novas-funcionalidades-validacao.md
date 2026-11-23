# MamaBloom: novas funcionalidades para validação

Implementação em 23/11/2026 na branch `codex/mamabloom-novas-funcionalidades`.

## Referência publicada

Comparação de leitura feita no workspace Render `test-devs`, confirmado pelo usuário:
- Frontend `mamabloom`: deploy `dep-dad9ds5g1s2s73fjspb0`, live, commit `e69cdf2bb765364e4f5ad639ee73e1de186049e1`.
- API `mamabloom-api`: deploy `dep-dahva9jm8hqs73dh8gng`, live, mesmo commit (consulta anterior de 23/11/2026).
- Ambos acompanham a main. Esta branch parte desse commit e não é a branch de produção.
- Não foi disparado deploy nem alterada a main.
- O trabalho local anterior em `codex/mamabloom-planos-saude-foto` permanece separado.

## O que foi implementado

- Título MamaBloom centralizado nos planos.
- Edição do nome do bebê pela legenda da imagem gestacional, com persistência na conta.
- Foto de perfil editável (PNG, JPEG ou WebP, até 200 KB), salva na conta.
- Linha de gestação com o mesmo fundo dos atalhos do perfil; remoção do balão bege decorativo.
- Cinco leituras adaptadas dos modelos editoriais fornecidos, disponíveis na Central de Apoio. A leitura diária na home usa a data de São Paulo e abre o artigo correspondente; a lista de cartões de artigos foi removida da página inicial.
- Nesta revisão visual, a leitura diária recuperou o texto branco e a aparência anterior, a foto de perfil ficou dentro da moldura hexagonal amarela, e as páginas de artigos, empresas e administração receberam detalhes amarelos da paleta.
- Remoção do bloco Recursos de acolhimento, substituído pelos artigos.
- Perfis sugeridos vindos de contas reais; o + cria uma amizade persistente sem duplicidade. Contatos de confiança permanecem separados.
- Conversa entre amigas adicionadas com mensagens persistidas e acesso restrito às duas contas.
- Cadastro profissional separado, sem exigir preencher uma gestação. Psicólogos enviam perfil para análise e só aparecem após aprovação administrativa.
- Perfil profissional com nome, foto, idade, formação, experiência, registro, especialidades e apresentação.
- Horários publicados pelo próprio psicólogo após aprovação; reservas persistentes e verificadas no servidor, com prevenção de conflito.
- Consultas aparecem na agenda da mãe ou do profissional a partir do mesmo registro, sem duplicação em compromissos pessoais.
- Chat bilateral por consulta, com histórico, atualização periódica e proteção contra repetição no reenvio.
- Link Meet informado pelo profissional. O acesso para a paciente é liberado no dia da consulta em São Paulo e deixa de ser liberado após o término.
- Cadastro de empresas com status pendente e acompanhamento pela conta responsável.
- Administração com abas de Psicólogos e Empresas, aprovação/rejeição, justificativa e registro de responsável/data.

## Rodar e testar localmente

As portas desta demonstração são 5174 (app) e 3002 (API), separadas da demonstração anterior.

1. Instalar dependências na raiz: `pnpm install --frozen-lockfile`.
2. Com a API parada, criar somente os dados fictícios locais: `node api/scripts/seed-demo.mjs`. Se ela já estava rodando, reiniciá-la para carregar as novas contas.
3. Iniciar a API a partir da pasta api, com as variáveis abaixo:

```powershell
$env:DATA_STORE='json'
$env:DATA_FILE_PATH='./data/local-features.json'
$env:JWT_SECRET=[guid]::NewGuid().ToString('N')+[guid]::NewGuid().ToString('N')
$env:NODE_ENV='development'
$env:PORT='3002'
$env:CORS_ORIGIN='http://localhost:5174,http://127.0.0.1:5174'
$env:SESSION_COOKIE_NAME='mamabloom_features_demo'
node --watch src/server.js
```

4. Em outro terminal, a partir de app:

```powershell
$env:VITE_API_URL='http://127.0.0.1:3002'
pnpm dev --host 127.0.0.1 --port 5174 --strictPort
```

5. Abrir http://127.0.0.1:5174/app/login. Usar `127.0.0.1` nos dois serviços para manter o cookie no mesmo site. Nesta máquina, outro serviço atende `localhost:3002` pelo IPv6, por isso o endereço explícito evita a colisão.

| Conta | Login | Uso |
| --- | --- | --- |
| Mãe | demo@mamabloom.local | Home, nome do bebê, artigos, amizades e agendamento |
| Amiga | amiga@mamabloom.local | Receber amizade e conversar |
| Psicólogo aprovado | psico@mamabloom.local | Publicar horários, receber consultas, responder no chat e informar Meet |
| Administrador | admin@mamabloom.local | Analisar empresas e profissionais |
| Outro psicólogo | pendente@mamabloom.local | Ver status do próprio perfil; foi aprovado durante o teste de navegador |
| Nova amiga sugerida | beatriz@mamabloom.local | Perfil disponível para testar o botão + |
| Psicólogo para analisar | revisao@mamabloom.local | Perfil aguardando aprovação no painel administrativo |

Senha de todas as contas fictícias locais: `MamaBloom@2026`.
O script não acessa DATABASE_URL e se recusa a rodar em NODE_ENV=production. O arquivo de demonstração fica em api/data, ignorado pelo Git. Rodar o script novamente preserva contas e conversas existentes.

## Administração em ambiente real

Não há senha administrativa fixa nem concessão de privilégio pelo frontend. Criar uma conta normal e, no servidor configurado para o armazenamento correto, executar:

```text
node scripts/grant-admin.mjs <UUID da conta existente>
```

O privilégio é um registro interno que não pode ser escrito pela API genérica de dados. Mudanças de e-mail não concedem privilégios. Nenhuma conta de produção recebeu privilégios nesta tarefa.

## Persistência e limites da primeira entrega

- PostgreSQL: migração idempotente acrescenta avatar e um registro JSONB compartilhado para o módulo de comunidade. As mutações usam transação e bloqueio da linha para serializar reservas. Esse desenho simplifica a primeira entrega; um volume maior de conversas/consultas deve migrar para tabelas por entidade e paginação.
- JSON: arquivo local com fila de gravação atômica para uma única instância. Não usar múltiplas instâncias sobre o mesmo arquivo; no filesystem efêmero do Render, os dados JSON podem ser perdidos após reinício/deploy. A implementação também suporta PostgreSQL.
- Meet: não há criação automática de salas. O profissional cria a reunião no Google e informa o link real. A validação do formato não verifica se uma sala existe; não foi realizada uma chamada externa no Google Meet durante os testes.
- Chat atualiza a cada cinco segundos e exibe as últimas 500 mensagens; não tem anexos, indicadores de leitura ou notificações push.
- Edições do perfil profissional voltam para análise. Novas reservas ficam bloqueadas enquanto pendente; consultas já confirmadas e seus chats permanecem acessíveis aos participantes.
- Cancelamento/reagendamento, cobrança e integração automática com Google Calendar não fazem parte desta entrega.
- O administrador analisa os dados informados; a plataforma não realiza verificação automática de registro profissional.

## Validação

- Verificações de API e frontend, testes de acesso entre contas, aprovação, isolamento de mensagens, reenvio sem duplicação, persistência e conflito de reservas.
- Repositório PostgreSQL exercitado com pg-mem; concorrência de gravação JSON testada. Não houve teste de carga ou conexão ao PostgreSQL de produção.
- Navegador: login, edição de nome, amizade, reserva, envio/recebimento de mensagens em contas distintas, painel profissional, aprovação e abas administrativas. Nesta revisão, a home foi conferida sem os cartões de artigos, com leitura diária em branco, e a foto foi conferida dentro da moldura amarela.
- Conferência visual dos planos em tela estreita; revisão de responsividade das novas páginas.

A integração na main depende da validação explícita do usuário.
