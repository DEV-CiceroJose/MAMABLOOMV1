# Design: acesso ao aplicativo pela landing page

## Contexto

A landing page publica a apresentação institucional do MamaBloom na rota raiz, enquanto o produto React/Vite está disponível em `/app/`. Atualmente, a landing não oferece um caminho direto e evidente para o aplicativo.

## Objetivo

Criar dois pontos de entrada consistentes para o aplicativo sem alterar a estrutura visual existente:

- um CTA no menu superior;
- um CTA na área principal (hero), junto às ações atuais.

## Solução aprovada

Os dois CTAs usarão o texto **Acessar o app** e navegarão para `/app/` na mesma aba. O caminho relativo preserva o funcionamento tanto no domínio publicado quanto no ambiente local.

### Menu superior

- Adicionar o CTA depois dos links institucionais existentes.
- Diferenciá-lo como ação principal, reutilizando a linguagem visual dos botões atuais.
- Mantê-lo dentro do menu responsivo para continuar acessível pelo menu hambúrguer no celular.

### Área principal

- Adicionar o CTA ao grupo de ações existente.
- Dar a ele a maior hierarquia visual do grupo.
- Preservar os botões “Conhecer” e “Nossos Serviços”.
- Permitir quebra de linha no grupo em larguras menores, evitando sobreposição ou corte.

## Consistência e acessibilidade

- Reutilizar cores, tipografia, bordas, transições e classes já presentes sempre que possível.
- Manter texto legível, contraste suficiente e foco de teclado perceptível.
- Usar um link semântico (`a`) porque a ação realiza navegação.
- Não adicionar bibliotecas ou dependências.

## Validação

- Criar uma verificação automatizada simples para confirmar que os dois links existem, usam o texto e apontam para `/app/`.
- Executar as validações existentes da landing e do aplicativo.
- Conferir visualmente a landing em desktop e celular, incluindo o menu hambúrguer.

## Fora de escopo

- Alterar telas internas do aplicativo.
- Modificar os CTAs institucionais existentes.
- Criar autenticação, redirecionamento condicional ou abertura em nova aba.
