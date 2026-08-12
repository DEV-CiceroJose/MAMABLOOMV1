# MamaBloom App

Aplicativo mobile-first do MamaBloom, construído com React JavaScript e Vite. A landing page original permanece na raiz do repositório; este projeto é uma aplicação independente preparada para ser publicada em `/app/`.

## Executar

```bash
pnpm install
pnpm dev
```

No ambiente local, acesse `http://localhost:5173/app/`.

## Validar

```bash
pnpm check
```

O comando executa análise estática, testes e build de produção.

## Escopo atual

- boas-vindas;
- login real por e-mail ou CPF;
- cadastro em duas etapas;
- cálculo inicial da semana gestacional;
- sessão protegida por cookie `HttpOnly`;
- sincronização com a API, mantendo contingência local isolada por conta quando a conexão oscila;
- shell mobile e navegação protegida;
- design system baseado no protótipo do Canva.

Configure `VITE_API_URL` para apontar para a API. Sem essa variável, o ambiente de desenvolvimento usa `http://localhost:3001`.
