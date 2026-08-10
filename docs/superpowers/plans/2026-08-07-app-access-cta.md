# App Access CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir dois acessos claros para o aplicativo na landing page, no menu superior e no hero, ambos direcionando para `/app/`.

**Architecture:** A mudança permanece na landing estática existente. O HTML recebe dois links semânticos e o CSS acrescenta modificadores pequenos para hierarquia visual e responsividade, sem alterar o aplicativo React/Vite ou adicionar dependências.

**Tech Stack:** HTML5, CSS3, Bootstrap 5 existente e Node.js Test Runner.

## Global Constraints

- Usar o texto exato `Acessar o app` nos dois CTAs.
- Usar o destino exato `/app/` e abrir na mesma aba.
- Preservar os botões `Conhecer` e `Nossos Serviços`.
- Manter o CTA do menu dentro do menu responsivo existente.
- Reutilizar as variáveis, transições e classes visuais existentes.
- Não adicionar bibliotecas ou dependências.

---

### Task 1: CTAs de acesso ao aplicativo

**Files:**
- Modify: `scripts/build-static-site.test.mjs:11-20`
- Modify: `index.html:64-73`
- Modify: `index.html:123-128`
- Modify: `css/style.css:205-255`
- Modify: `css/style.css:368-386`
- Modify: `css/style.css:812-840`

**Interfaces:**
- Consumes: a rota pública `/app/`, o menu responsivo `#navbarCollapse`, o grupo flexível de ações do hero e as variáveis CSS `--mb-primary`, `--mb-primary-dark`, `--mb-white`, `--mb-border` e `--mb-transition`.
- Produces: exatamente dois links com `href="/app/"` e texto visível `Acessar o app`, identificados visualmente pelas classes `app-cta` com modificadores `app-cta--nav` e `app-cta--hero`.

- [ ] **Step 1: Escrever a verificação que falha**

No primeiro teste de `scripts/build-static-site.test.mjs`, armazenar o HTML da landing empacotada e exigir exatamente dois destinos e dois rótulos:

```js
  const landingHtml = await readFile(join(output, 'index.html'), 'utf8')

  assert.match(landingHtml, /MamaBloom/i)
  assert.equal(landingHtml.match(/href="\/app\/"/g)?.length, 2)
  assert.equal(landingHtml.match(/>Acessar o app<\/a>/g)?.length, 2)
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `pnpm test:site`

Expected: FAIL no teste `empacota landing e aplicativo no mesmo diretório estático`, porque os dois links ainda não existem.

- [ ] **Step 3: Implementar os dois links semânticos**

Adicionar ao final de `.navbar-nav` em `index.html`:

```html
<a href="/app/" class="nav-item nav-link app-cta app-cta--nav">Acessar o app</a>
```

Adicionar como primeira ação do hero:

```html
<a href="/app/" class="btn btn-primary px-5 py-3 btn-border-radius app-cta app-cta--hero">Acessar o app</a>
```

Preservar imediatamente depois os links `Conhecer` e `Nossos Serviços`.

- [ ] **Step 4: Aplicar a hierarquia visual e a responsividade**

Adicionar estilos focados para o CTA do menu:

```css
.navbar .navbar-nav .app-cta--nav {
  margin-left: 8px;
  padding-inline: 20px;
  color: var(--mb-white);
  background: var(--mb-primary);
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(76, 170, 179, 0.25);
}

.navbar .navbar-nav .app-cta--nav:hover,
.navbar .navbar-nav .app-cta--nav:focus {
  color: var(--mb-white);
  background: var(--mb-primary-dark);
}

.navbar .navbar-nav .app-cta--nav::after {
  display: none;
}
```

Fixar a hierarquia do hero sem depender de `:first-of-type` ou `:last-of-type`:

```css
#home .app-cta--hero {
  background: var(--mb-primary) !important;
  border: 2px solid var(--mb-primary) !important;
}

#home a[href="#sobre"].btn-border-radius,
#home a[href="#servicos"].btn-border-radius {
  background: rgba(255,255,255,0.15) !important;
  border: 2px solid rgba(255,255,255,0.7) !important;
  color: var(--mb-white) !important;
  backdrop-filter: blur(4px);
}
```

No breakpoint móvel já existente, alinhar o CTA do menu com os demais itens:

```css
.navbar .navbar-nav .app-cta--nav {
  margin: 8px 0;
  text-align: center;
}
```

- [ ] **Step 5: Executar as verificações automatizadas**

Run: `pnpm test:site`

Expected: todos os testes da landing PASS.

Run: `pnpm --dir app check`

Expected: lint, testes e build do aplicativo PASS.

Run: `pnpm build:site`

Expected: build estático concluído com a landing na raiz e o aplicativo em `site-dist/app/`.

- [ ] **Step 6: Conferir visualmente desktop e celular**

Abrir a landing local e verificar:

- o CTA aparece no menu desktop sem comprimir a marca ou a busca;
- o CTA aparece dentro do menu hambúrguer no celular;
- os três botões do hero quebram linha sem sobreposição;
- ambos os CTAs abrem `/app/` na mesma aba;
- o foco por teclado permanece perceptível.

- [ ] **Step 7: Criar o commit da implementação**

```powershell
git add -- scripts/build-static-site.test.mjs index.html css/style.css
git commit -m "feat: adiciona acesso ao app na landing"
```
