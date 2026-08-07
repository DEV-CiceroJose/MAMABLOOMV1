# MamaBloom Canva-Faithful Redesign

## Objetivo

Redesenhar toda a aplicação React/Vite para reproduzir com máxima fidelidade os 13 SVGs exportados do Canva, preservando as rotas, funcionalidades, dados locais e o menu hambúrguer existentes. As telas adicionadas depois do protótipo devem extrapolar a mesma linguagem visual sem parecerem módulos separados.

## Referência visual

Os SVGs de referência usam uma prancheta de 414 × 896 px e definem a direção principal:

- fundo creme quente;
- turquesa como cor estrutural;
- amarelo mel para ondas, botões e destaques;
- grandes recortes curvos e cantos arredondados;
- títulos arredondados com sombra clara;
- ilustrações de abelhas e fotografias recortadas;
- cards compactos, com baixa densidade de texto;
- barra inferior em formato de cápsula.

O redesign será mobile-first, com largura de referência de 414 px, largura máxima de 480 px e centralização em telas maiores.

## Abordagem escolhida

A interface será reconstruída em React e CSS responsivo. Os SVGs não serão usados como fundos completos porque isso prejudicaria acessibilidade, manutenção e adaptação de conteúdo. Imagens incorporadas nos arquivos do Canva serão extraídas, otimizadas para WebP e reutilizadas quando forem compatíveis com a tela correspondente.

O menu hambúrguer atual será preservado funcionalmente. Ele receberá somente os ajustes mínimos necessários para coexistir com os novos cabeçalhos.

## Sistema visual

### Cores

- creme de fundo: `#fff9e8`;
- turquesa principal: `#72cdd4`;
- turquesa escuro para texto e ícones: `#38a7b1`;
- amarelo mel: `#ffd677`;
- amarelo suave para campos: `#ffedbd`;
- verde-água suave para cards: `#e5f1e9`;
- grafite para texto: `#4a4a45`;
- coral apenas para alertas e estados críticos.

### Tipografia

Os títulos continuarão usando uma fonte arredondada próxima à referência do Canva, com peso elevado e sombra clara em composições sobre turquesa. Textos de apoio serão compactos e legíveis. A aplicação não dependerá de fontes proprietárias exportadas pelo Canva.

### Formas e espaçamento

- cabeçalhos com base ondulada ou canto inferior amplamente arredondado;
- cards com raios entre 18 e 34 px;
- botões em cápsula;
- espaçamento vertical mais compacto que a implementação atual;
- ilustrações parcialmente sobrepostas a ondas e cards;
- barra inferior com três ações, fundo turquesa ou amarelo conforme a tela.

## Arquitetura de componentes

O redesign preservará os componentes funcionais e criará uma camada visual reutilizável:

- `PrototypeHeader`: cabeçalhos curvos, título, busca opcional e ações;
- `PrototypeBottomNav`: variações turquesa e amarela da navegação inferior;
- `CanvaCard`: superfície visual comum para cards turquesa, amarelos e verde-água;
- `IllustratedActionCard`: cards de acesso com ilustração;
- `WaveSection`: recortes ondulados usados em acesso, perfil e áreas promocionais;
- `PrototypeSearch`: busca visual usada no início, agenda e loja;
- `CanvaPageTitle`: títulos grandes com sombra e comportamento responsivo.

`AppShell` continuará controlando menu, navegação e área principal. Os novos componentes receberão conteúdo por propriedades e não acessarão diretamente armazenamento ou autenticação.

## Redesign por tela

### Boas-vindas

Reproduzir logo central, dupla de abelhas, grande onda amarela inferior, título branco e dois botões compactos. A política de privacidade permanecerá no rodapé.

### Login e cadastro

Usar faixa turquesa curva no topo, filete amarelo e abelha sobreposta. Campos terão fundo amarelo suave, ícones lineares amarelos e altura semelhante ao protótipo. O cadastro continuará dividido em dados pessoais e gestação.

### Início

Reproduzir o cabeçalho com busca, nome em destaque, semana gestacional e ilustração circular. Agenda e diário serão os dois acessos principais ilustrados. O banner de leitura diária usará fotografia extraída ou substituta coerente. Recursos posteriores aparecerão em blocos compactos abaixo, sem competir com a composição original.

### Agenda

O calendário ficará dentro de um grande painel turquesa, com superfície interna azul-clara, mês em destaque e marcadores amarelos. Compromissos serão faixas simples alternando amarelo e turquesa.

### Diário

Usar saudação em cabeçalho amarelo, painel turquesa para humor, card de registro diário e lembrete compacto. O CRUD já existente permanece inalterado.

### Perfil

Reproduzir grade suave de fundo, avatar em moldura hexagonal amarela, nome central e ações em faixas azul-claras. As ações atuais de saúde, agenda e emergência serão encaixadas nessa estrutura.

### Bloomie

Reproduzir painel verde-água, abelha em destaque, balão de apresentação e compositor inferior turquesa. O histórico de conversa continuará rolável e usará balões coerentes com o protótipo.

### Cartão de emergência

Usar cabeçalho amarelo, card de identificação verde-água e grade de informações ilustradas. Edição, telefone e impressão continuarão funcionais.

### Apoio

Usar abertura turquesa com texto branco, card amarelo de destaque e listas compactas de rede de apoio. Respiração, favoritos e contato de confiança serão preservados dentro dessa linguagem.

### Loja

Reproduzir cabeçalho amarelo, faixa promocional fotográfica, busca, tabs em cápsula e catálogo compacto sobre painel turquesa. Imagens de produtos incorporadas ao SVG serão reutilizadas quando possível. Carrinho, quantidades e simulação de checkout permanecem funcionais.

### Saúde, relatórios, carrinho, planos e institucional

Essas telas usarão os mesmos cabeçalhos curvos, cards compactos, ondas, cápsulas e hierarquia cromática. Saúde e relatórios priorizarão turquesa; carrinho e planos combinarão turquesa e amarelo; institucional usará um hero turquesa com indicadores em cards verde-água.

## Ativos visuais

As imagens serão tratadas nesta ordem:

1. reutilizar logo e abelhas já otimizadas no projeto;
2. extrair fotografias e produtos incorporados nos SVGs do Canva;
3. usar imagens substitutas apenas quando não houver ativo aproveitável;
4. otimizar imagens finais para WebP, com dimensões adequadas ao uso;
5. incluir texto alternativo somente em imagens informativas; ilustrações decorativas terão `alt=""`.

## Comportamento e dados

Nenhum contrato funcional será removido. Autenticação simulada, agenda, diário, saúde, emergência, Bloomie, relatórios, favoritos, carrinho, planos e interesse institucional continuarão usando as mesmas chaves de armazenamento local. O redesign não adicionará backend, pagamento real ou envio de formulários.

## Responsividade e acessibilidade

- referência principal: 414 × 896 px;
- suporte mínimo: 320 px;
- largura máxima do aplicativo: 480 px;
- centralização e fundo decorativo em desktop;
- ausência de rolagem horizontal global;
- foco de teclado visível;
- áreas de toque com pelo menos 40 px;
- contraste preservado em textos pequenos;
- suporte a movimento reduzido.

## Testes e validação

- manter os 13 testes automatizados existentes;
- adicionar testes para componentes visuais quando houver comportamento ou variação funcional;
- executar lint, testes e build após cada conjunto de telas;
- comparar visualmente as telas em 414 × 896 px com os 13 SVGs;
- testar fluxos principais em celular e desktop;
- verificar rotas protegidas, persistência e ausência de overflow;
- executar uma validação final completa antes do commit e do deploy.

## Publicação na Render

A publicação entregará um único site estático:

- landing page em `/`;
- aplicação React/Vite em `/app/`;
- assets da landing preservados;
- build da aplicação copiado para o subdiretório `app/` do artefato final;
- regra de rewrite para rotas internas de `/app/*` apontarem para `/app/index.html`;
- nenhuma variável secreta será necessária nesta fase.

O deploy será feito somente depois da validação local e do versionamento do redesign. O endereço publicado deverá responder corretamente tanto na landing quanto nas rotas internas do aplicativo.

## Fora de escopo

- backend e banco de dados;
- autenticação real;
- pagamentos;
- envio externo de formulários;
- prontuário médico;
- substituição do menu hambúrguer atual;
- alterações na lógica de negócio já validada.
