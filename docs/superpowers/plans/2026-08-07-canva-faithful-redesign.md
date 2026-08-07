# MamaBloom Canva-Faithful Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir toda a interface MamaBloom com máxima fidelidade aos 13 SVGs do Canva, preservar os fluxos existentes e publicar landing e aplicativo no mesmo site da Render.

**Architecture:** A lógica das páginas e as chaves de armazenamento local serão mantidas. Uma camada visual compartilhada será criada em componentes React pequenos e classes CSS orientadas aos padrões do Canva; cada grupo de telas migrará para essa camada sem alterar seus contratos funcionais. O deploy gerará um artefato estático único com a landing na raiz e o build Vite dentro de `/app/`.

**Tech Stack:** React 19, React Router 7, Vite 8, CSS responsivo, Vitest, Testing Library, Oxlint, pnpm, Render Static Site.

## Global Constraints

- Preservar o menu hambúrguer funcional atual.
- Preservar todas as rotas, fluxos e chaves de `localStorage`/`sessionStorage` existentes.
- Usar 414 × 896 px como referência visual, com suporte a 320–480 px e centralização em desktop.
- Priorizar ativos incorporados nos SVGs e otimizar imagens finais para WebP.
- Não adicionar backend, autenticação real, pagamento real ou envio externo de formulários.
- Manter landing em `/` e aplicação React em `/app/` na publicação da Render.
- Executar testes em ciclo vermelho-verde-refatoração para todo comportamento novo.

---

## File Map

### Create

- `app/src/components/prototype/PrototypeHeader.jsx`: cabeçalho curvo e busca opcional.
- `app/src/components/prototype/PrototypeBottomNav.jsx`: barra inferior em cápsula.
- `app/src/components/prototype/CanvaCard.jsx`: superfícies reutilizáveis.
- `app/src/components/prototype/IllustratedActionCard.jsx`: atalhos ilustrados.
- `app/src/components/prototype/WaveSection.jsx`: ondas decorativas acessíveis.
- `app/src/components/prototype/PrototypeSearch.jsx`: campo de busca do protótipo.
- `app/src/components/prototype/CanvaPageTitle.jsx`: título arredondado com variações.
- `app/src/components/prototype/prototype-components.test.jsx`: contratos de renderização dos componentes.
- `app/src/styles/prototype.css`: tokens, componentes e padrões visuais compartilhados.
- `app/public/prototype/`: fotografias e imagens extraídas e otimizadas.
- `scripts/extract-canva-assets.mjs`: extração determinística de imagens incorporadas nos SVGs.
- `scripts/extract-canva-assets.test.mjs`: contrato da extração e deduplicação.
- `scripts/build-static-site.mjs`: montagem do artefato landing + aplicativo.
- `scripts/build-static-site.test.mjs`: teste do empacotamento estático.
- `package.json`: comando raiz de build do site completo.
- `render.yaml`: definição do Static Site e rewrite de `/app/*`.
- `.gitignore`: exclusão do artefato `site-dist/`.

### Modify

- `app/src/components/AppShell.jsx`: usar cabeçalho e barra inferior compartilhados.
- `app/src/components/AuthFrame.jsx`: aceitar composição curva e ilustração por tela.
- `app/src/components/PageTitle.jsx`: delegar aparência a `CanvaPageTitle`.
- `app/src/components/Icon.jsx`: somente ícones necessários ao protótipo.
- `app/src/pages/*.jsx`: migrar composição visual sem alterar dados e handlers.
- `app/src/styles/index.css`: importar `prototype.css` e remover regras substituídas.
- `app/vite.config.js`: manter `base: '/app/'` e incluir testes novos.

---

### Task 1: Extract and Optimize Canva Assets

**Files:**
- Create: `scripts/extract-canva-assets.mjs`
- Create: `scripts/extract-canva-assets.test.mjs`
- Create: `app/public/prototype/home-reading.webp`
- Create: `app/public/prototype/store-promo.webp`
- Create: `app/public/prototype/store-product-*.webp`
- Create: `app/public/prototype/support-avatar-*.webp`
- Reuse: `app/public/brand/logo.webp`
- Reuse: `app/public/brand/bee-baby.webp`
- Reuse: `app/public/brand/bee-flower.webp`

**Interfaces:**
- Produces: `extractDataImages(svgText) -> Array<{ mimeType, bytes, hash }>` e caminhos estáveis sob `${import.meta.env.BASE_URL}prototype/`.
- Consumes: 13 SVGs em `C:/Users/nauam/Downloads/mamabloom/`.

- [ ] **Step 1: Write the failing extractor test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { extractDataImages } from './extract-canva-assets.mjs'

test('extracts and deduplicates embedded Canva images', () => {
  const png = Buffer.from('same-image').toString('base64')
  const svg = `<svg><image href="data:image/png;base64,${png}"/><image href="data:image/png;base64,${png}"/></svg>`
  const images = extractDataImages(svg)
  assert.equal(images.length, 1)
  assert.equal(images[0].mimeType, 'image/png')
  assert.deepEqual(images[0].bytes, Buffer.from('same-image'))
})
```

- [ ] **Step 2: Run extractor test and verify RED**

Run: `node --test scripts/extract-canva-assets.test.mjs`

Expected: FAIL because `extractDataImages` does not exist.

- [ ] **Step 3: Implement extraction and deduplication**

Parse `data:image/(png|jpeg|webp);base64,...` values, decode bytes, calculate SHA-256 and retain only the first image for each hash. The CLI must require explicit `--input` and `--output` paths and never delete a path it did not create.

- [ ] **Step 4: Render the 13 SVGs and inventory embedded images**

Use Sharp to render each SVG and extract embedded `data:image/*;base64` payloads into a temporary directory. Record image dimensions and hashes so duplicates are discarded.

Run:

```powershell
node scripts/extract-canva-assets.mjs --input "C:/Users/nauam/Downloads/mamabloom" --output "$env:TEMP/mamabloom-assets"
```

Expected: 13 rendered screens and a JSON inventory containing MIME type, width, height, hash and source SVG.

- [ ] **Step 5: Select the exact assets used by the approved design**

Select the reading banner from screen 5, promotional banner and product photos from screen 7, and support avatars from screen 13. Keep existing optimized bee and logo assets when they match the SVG.

- [ ] **Step 6: Optimize selected images**

Convert photos to WebP at 82% quality, limiting banner width to 900 px and card images to 420 px. Keep transparent bee assets unchanged unless the extracted version is visually closer.

- [ ] **Step 7: Verify dimensions and file sizes**

Run:

```powershell
Get-ChildItem app/public/prototype -File | Select-Object Name,Length
```

Expected: every image under 250 KB; no duplicate hashes; banners wider than their rendered container.

- [ ] **Step 8: Verify extractor test and commit assets**

Run: `node --test scripts/extract-canva-assets.test.mjs`

Expected: PASS.

```powershell
git add scripts/extract-canva-assets.mjs scripts/extract-canva-assets.test.mjs app/public/prototype
git commit -m "assets: adiciona imagens otimizadas do protótipo Canva"
```

### Task 2: Build the Shared Canva Visual Layer

**Files:**
- Create: `app/src/components/prototype/PrototypeHeader.jsx`
- Create: `app/src/components/prototype/PrototypeBottomNav.jsx`
- Create: `app/src/components/prototype/CanvaCard.jsx`
- Create: `app/src/components/prototype/IllustratedActionCard.jsx`
- Create: `app/src/components/prototype/WaveSection.jsx`
- Create: `app/src/components/prototype/PrototypeSearch.jsx`
- Create: `app/src/components/prototype/CanvaPageTitle.jsx`
- Create: `app/src/components/prototype/prototype-components.test.jsx`
- Create: `app/src/styles/prototype.css`
- Modify: `app/src/styles/index.css`

**Interfaces:**
- Produces: `PrototypeHeader({ title, search, actions, tone })`, `PrototypeBottomNav({ tone })`, `CanvaCard({ tone, className, children })`, `IllustratedActionCard({ to, image, label })`, `WaveSection({ tone, children })`, `PrototypeSearch({ value, onChange, label })`, `CanvaPageTitle({ title, eyebrow, backTo, action })`.
- Consumes: `Icon`, `NavLink`, `Link`, `BrandLogo`.

- [ ] **Step 1: Write failing component contract tests**

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrototypeHeader from './PrototypeHeader.jsx'
import PrototypeBottomNav from './PrototypeBottomNav.jsx'
import CanvaCard from './CanvaCard.jsx'

test('renders the curved header with an accessible search field', () => {
  render(<MemoryRouter><PrototypeHeader title="ALÍCIA" search /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'ALÍCIA' })).toBeInTheDocument()
  expect(screen.getByRole('searchbox', { name: 'Pesquisar' })).toBeInTheDocument()
})

test('renders the three prototype navigation destinations', () => {
  render(<MemoryRouter><PrototypeBottomNav tone="aqua" /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/inicio')
  expect(screen.getByRole('link', { name: 'Bloomie' })).toHaveAttribute('href', '/bloomie')
  expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil')
})

test('applies the requested Canva card tone', () => {
  render(<CanvaCard tone="yellow">Conteúdo</CanvaCard>)
  expect(screen.getByText('Conteúdo')).toHaveClass('canva-card--yellow')
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm test src/components/prototype/prototype-components.test.jsx`

Expected: FAIL because the prototype components do not exist.

- [ ] **Step 3: Implement minimal component APIs**

Implement each component as a semantic wrapper. Example contract:

```jsx
export default function CanvaCard({ children, className = '', tone = 'cream' }) {
  return <article className={`canva-card canva-card--${tone} ${className}`.trim()}>{children}</article>
}
```

`PrototypeSearch` must render `<input type="search" aria-label="Pesquisar" />`. Decorative wave elements must use `aria-hidden="true"`.

- [ ] **Step 4: Add exact visual tokens and component CSS**

Define the approved colors, radii, title shadows, 414 px reference spacing, wave pseudo-elements, capsule navigation and reduced-motion behavior in `prototype.css`. Import it after the base reset in `index.css`.

- [ ] **Step 5: Run component tests and verify GREEN**

Run: `pnpm test src/components/prototype/prototype-components.test.jsx`

Expected: 3 tests PASS.

- [ ] **Step 6: Run full validation**

Run: `pnpm lint && pnpm test && pnpm build`

Expected: all existing and new checks PASS.

- [ ] **Step 7: Commit shared visual layer**

```powershell
git add app/src/components/prototype app/src/styles/prototype.css app/src/styles/index.css
git commit -m "feat: cria sistema visual fiel ao Canva"
```

### Task 3: Redesign Welcome, Login and Registration

**Files:**
- Modify: `app/src/components/AuthFrame.jsx`
- Modify: `app/src/pages/WelcomePage.jsx`
- Modify: `app/src/pages/LoginPage.jsx`
- Modify: `app/src/pages/RegisterPage.jsx`
- Modify: `app/src/pages/PregnancyStepPage.jsx`
- Modify: `app/src/styles/index.css`
- Test: `app/src/lib/validation.test.js`

**Interfaces:**
- Consumes: `WaveSection`, `BrandLogo`, `FormField`, current auth handlers.
- Preserves: `/`, `/login`, `/cadastro`, `/cadastro/gestacao`, `mamabloom:session`, `mamabloom:registration-draft`.

- [ ] **Step 1: Add a failing regression test for the two-step registration contract**

```js
it('keeps pregnancy weeks within the supported range', () => {
  expect(validatePregnancy({ dueDate: '', weeks: '0' }).weeks).toBeTruthy()
  expect(validatePregnancy({ dueDate: '', weeks: '43' }).weeks).toBeTruthy()
  expect(validatePregnancy({ dueDate: '', weeks: '21' }).weeks).toBeUndefined()
})
```

- [ ] **Step 2: Run the focused test and verify RED if the boundary is missing**

Run: `pnpm test src/lib/validation.test.js`

Expected: FAIL only if the existing validator does not enforce 1–42 weeks; otherwise document that the behavior already exists and keep the passing regression test.

- [ ] **Step 3: Implement the approved access compositions**

Rebuild welcome with logo, two bees and yellow lower wave. Rebuild login and first registration step with turquoise curved top, yellow accent line and overlapping bee. Keep form names, labels, submit handlers, password visibility and navigation unchanged.

- [ ] **Step 4: Implement the pregnancy step composition**

Use the compact two-field layout from screen 4 while preserving accepted inputs and submit behavior.

- [ ] **Step 5: Verify auth flows**

Run: `pnpm lint && pnpm test && pnpm build`

Expected: all checks PASS; protected routes still redirect unauthenticated users.

- [ ] **Step 6: Commit auth redesign**

```powershell
git add app/src/components/AuthFrame.jsx app/src/pages/WelcomePage.jsx app/src/pages/LoginPage.jsx app/src/pages/RegisterPage.jsx app/src/pages/PregnancyStepPage.jsx app/src/styles/index.css app/src/lib/validation.test.js app/src/lib/validation.js
git commit -m "feat: aproxima acesso e cadastro do protótipo Canva"
```

### Task 4: Redesign App Shell and Home

**Files:**
- Modify: `app/src/components/AppShell.jsx`
- Modify: `app/src/components/PageTitle.jsx`
- Modify: `app/src/pages/HomePreviewPage.jsx`
- Modify: `app/src/styles/index.css`
- Test: `app/src/components/prototype/prototype-components.test.jsx`

**Interfaces:**
- Consumes: shared prototype components and existing `menuItems`.
- Preserves: drawer behavior, logout, `/inicio`, `/bloomie`, `/perfil` navigation.

- [ ] **Step 1: Add a failing AppShell navigation test**

Render `AppShell` with `AuthContext` and assert that the menu button remains available and bottom navigation is rendered once. The test must fail before AppShell adopts `PrototypeBottomNav` by asserting `.prototype-bottom-nav`.

- [ ] **Step 2: Run focused test and verify RED**

Run: `pnpm test src/components/prototype/prototype-components.test.jsx`

Expected: FAIL because `.prototype-bottom-nav` is not present in `AppShell`.

- [ ] **Step 3: Migrate AppShell without changing the drawer**

Keep drawer markup and handlers. Replace only header surface and bottom navigation with approved shared components. Ensure the drawer remains hidden when closed on desktop.

- [ ] **Step 4: Recompose the home screen**

Use the screen 5 hierarchy: searchable curved header, `ALÍCIA`-style name, pregnancy badge, circular illustration, Agenda and Diário illustrated cards, photographic reading banner, then compact sections for health, emergency, reports, support, shop and plans.

- [ ] **Step 5: Verify GREEN and all flows**

Run: `pnpm lint && pnpm test && pnpm build`

Expected: all checks PASS.

- [ ] **Step 6: Commit shell and home**

```powershell
git add app/src/components/AppShell.jsx app/src/components/PageTitle.jsx app/src/pages/HomePreviewPage.jsx app/src/styles/index.css app/src/components/prototype/prototype-components.test.jsx
git commit -m "feat: redesenha navegação e início conforme o Canva"
```

### Task 5: Redesign Agenda, Diary and Profile

**Files:**
- Modify: `app/src/pages/AgendaPage.jsx`
- Modify: `app/src/pages/DiaryPage.jsx`
- Modify: `app/src/pages/ProfilePage.jsx`
- Modify: `app/src/styles/index.css`
- Test: `app/src/lib/date.test.js`

**Interfaces:**
- Preserves: `mamabloom:appointments`, `mamabloom:diary`, `mamabloom:diary-reminder` and current CRUD handlers.
- Consumes: `CanvaCard`, `CanvaPageTitle`, existing date helpers.

- [ ] **Step 1: Add failing calendar-grid boundary tests**

```js
it('always returns complete calendar weeks', () => {
  expect(getMonthGrid(2026, 7).length % 7).toBe(0)
  expect(getMonthGrid(2026, 7).filter(Boolean)).toHaveLength(31)
})
```

- [ ] **Step 2: Run date tests and verify the regression contract**

Run: `pnpm test src/lib/date.test.js`

Expected: PASS if existing helper already satisfies the contract; keep the test as protection during markup changes.

- [ ] **Step 3: Recompose Agenda**

Place the existing month grid inside the large turquoise panel with an inner blue surface. Render selected-day and event markers in yellow. Preserve add, month navigation and delete controls.

- [ ] **Step 4: Recompose Diary**

Use yellow greeting header, turquoise mood panel, diary card and reminder strip. Preserve save, delete and reminder behavior.

- [ ] **Step 5: Recompose Profile**

Use grid background, hexagonal avatar frame, centered identity and blue action strips. Preserve links and privacy copy.

- [ ] **Step 6: Validate and commit**

Run: `pnpm lint && pnpm test && pnpm build`

```powershell
git add app/src/pages/AgendaPage.jsx app/src/pages/DiaryPage.jsx app/src/pages/ProfilePage.jsx app/src/styles/index.css app/src/lib/date.test.js
git commit -m "feat: redesenha agenda diario e perfil"
```

### Task 6: Redesign Bloomie, Emergency and Support

**Files:**
- Modify: `app/src/pages/BloomiePage.jsx`
- Modify: `app/src/pages/EmergencyCardPage.jsx`
- Modify: `app/src/pages/SupportPage.jsx`
- Modify: `app/src/styles/index.css`
- Test: `app/src/lib/bloomie.test.js`

**Interfaces:**
- Preserves: `mamabloom:bloomie-chat`, `mamabloom:emergency-card`, `mamabloom:support-favorites` and safety responses.
- Consumes: optimized bee and support avatar assets.

- [ ] **Step 1: Add a failing safety regression test for urgent accented input**

```js
it('recognizes accented emergency language', () => {
  const reply = createBloomieReply('É uma emergência, estou com falta de ar')
  expect(reply.tone).toBe('urgent')
  expect(reply.text).toContain('serviço de emergência')
})
```

- [ ] **Step 2: Run Bloomie tests and verify RED only if normalization is incomplete**

Run: `pnpm test src/lib/bloomie.test.js`

Expected: PASS if current normalization already covers the case; otherwise FAIL for the missing urgent classification and fix minimally before continuing.

- [ ] **Step 3: Recompose Bloomie**

Use the green-aqua immersive panel, large bee, introduction bubble and bottom composer from screen 11. Preserve scrollable history, suggestions and urgent-message styling.

- [ ] **Step 4: Recompose Emergency**

Use yellow header, identity card and illustrated information grid from screen 12. Preserve edit, save, telephone and print.

- [ ] **Step 5: Recompose Support**

Use turquoise opening, yellow therapy highlight, compact contact list and suggested profiles. Fit breathing and favorites into this hierarchy without adding social-network behavior.

- [ ] **Step 6: Validate and commit**

Run: `pnpm lint && pnpm test && pnpm build`

```powershell
git add app/src/pages/BloomiePage.jsx app/src/pages/EmergencyCardPage.jsx app/src/pages/SupportPage.jsx app/src/styles/index.css app/src/lib/bloomie.test.js app/src/lib/bloomie.js
git commit -m "feat: redesenha Bloomie emergencia e apoio"
```

### Task 7: Redesign Store, Cart and Plans

**Files:**
- Modify: `app/src/pages/ShopPage.jsx`
- Modify: `app/src/pages/CartPage.jsx`
- Modify: `app/src/pages/PlansPage.jsx`
- Modify: `app/src/data/storeData.js`
- Modify: `app/src/styles/index.css`
- Test: `app/src/lib/cart.test.js`

**Interfaces:**
- Preserves: `mamabloom:cart`, `mamabloom:selected-plan`, `addCartItem`, `updateCartItem`, `cartTotal`.
- Consumes: extracted promo and product images.

- [ ] **Step 1: Add failing cart-total edge-case test**

```js
it('ignores catalog items that no longer exist', () => {
  const cart = [{ productId: 'removido', quantity: 2 }]
  expect(cartTotal(cart, [])).toBe(0)
})
```

- [ ] **Step 2: Run focused tests and confirm contract**

Run: `pnpm test src/lib/cart.test.js`

Expected: PASS if current helper already ignores unknown products; retain as regression coverage.

- [ ] **Step 3: Recompose Shop**

Use yellow curved header, photo promo carousel surface, compact search and three capsule tabs over a turquoise product panel. Replace icon-only product art with selected Canva product imagery while retaining names, prices and add buttons.

- [ ] **Step 4: Recompose Cart and Plans**

Use compact product strips and a yellow total card in Cart. Use vertically stacked cream/aqua plan cards with yellow selected state in Plans. Preserve simulated checkout and no-charge notices.

- [ ] **Step 5: Validate and commit**

Run: `pnpm lint && pnpm test && pnpm build`

```powershell
git add app/src/pages/ShopPage.jsx app/src/pages/CartPage.jsx app/src/pages/PlansPage.jsx app/src/data/storeData.js app/src/styles/index.css app/src/lib/cart.test.js
git commit -m "feat: redesenha loja carrinho e planos"
```

### Task 8: Redesign Health, Reports and Institutional

**Files:**
- Modify: `app/src/pages/HealthPage.jsx`
- Modify: `app/src/pages/ReportsPage.jsx`
- Modify: `app/src/pages/InstitutionalPage.jsx`
- Modify: `app/src/styles/index.css`

**Interfaces:**
- Preserves: `mamabloom:health-checks`, `mamabloom:institutional-requests`, print behavior and current forms.
- Consumes: approved Canva cards, page titles and visual tokens.

- [ ] **Step 1: Capture baseline semantic snapshots**

Record the current accessible headings, form labels and status messages for the three screens using the in-app browser DOM snapshot. These semantics are the regression contract.

- [ ] **Step 2: Recompose Health**

Use turquoise status panel, yellow choice capsules and compact check-in card. Keep the non-diagnostic notice visible above the submit action.

- [ ] **Step 3: Recompose Reports**

Use a turquoise summary hero, yellow metrics, aqua mood bars and compact printable sections.

- [ ] **Step 4: Recompose Institutional**

Use a turquoise B2G hero with yellow illustration, green-aqua indicator cards and cream presentation form. Keep the local-only notice adjacent to submission.

- [ ] **Step 5: Compare semantic snapshots and validate**

Confirm the same headings, labels and status messages remain available. Run: `pnpm lint && pnpm test && pnpm build`.

- [ ] **Step 6: Commit remaining screens**

```powershell
git add app/src/pages/HealthPage.jsx app/src/pages/ReportsPage.jsx app/src/pages/InstitutionalPage.jsx app/src/styles/index.css
git commit -m "feat: unifica saude relatorios e institucional ao Canva"
```

### Task 9: Build the Combined Static Artifact

**Files:**
- Create: `scripts/build-static-site.mjs`
- Create: `scripts/build-static-site.test.mjs`
- Create: `package.json`
- Create: `render.yaml`
- Create: `.gitignore`

**Interfaces:**
- Consumes: root landing files and `app/dist/`.
- Produces: `site-dist/index.html`, `site-dist/css/`, `site-dist/img/`, `site-dist/js/`, `site-dist/lib/`, `site-dist/app/index.html`, `site-dist/app/assets/`.

- [ ] **Step 1: Write failing build-script test**

```js
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildStaticSite } from './build-static-site.mjs'

test('packages landing and app under one static directory', async () => {
  const output = await mkdtemp(join(tmpdir(), 'mamabloom-site-'))
  await buildStaticSite({ rootDir: process.cwd(), outputDir: output })
  assert.match(await readFile(join(output, 'index.html'), 'utf8'), /MamaBloom/i)
  assert.match(await readFile(join(output, 'app', 'index.html'), 'utf8'), /\/app\/assets\//)
})
```

- [ ] **Step 2: Run test and verify RED**

Run: `node --test scripts/build-static-site.test.mjs`

Expected: FAIL because `buildStaticSite` does not exist.

- [ ] **Step 3: Implement deterministic packaging**

Export `buildStaticSite({ rootDir, outputDir })`. Remove only the explicit `outputDir`, recreate it, copy root landing assets (`index.html`, `css`, `img`, `js`, `lib`) and copy `app/dist` into `outputDir/app`. Reject output paths equal to repository root or drive root.

- [ ] **Step 4: Add root scripts and ignore generated output**

Use this root package contract:

```json
{
  "private": true,
  "scripts": {
    "build:app": "pnpm --dir app build",
    "build:site": "pnpm run build:app && node scripts/build-static-site.mjs",
    "test:site": "node --test scripts/build-static-site.test.mjs"
  }
}
```

Add `site-dist/` to `.gitignore`.

- [ ] **Step 5: Configure Render Blueprint**

Create a static service with build command `corepack enable && pnpm --dir app install --frozen-lockfile && pnpm run build:site`, publish path `site-dist`, and rewrite `/app/*` to `/app/index.html`. Confirm exact Blueprint keys against current official Render documentation or the installed Render connector before committing.

- [ ] **Step 6: Verify GREEN**

Run:

```powershell
pnpm --dir app check
node --test scripts/build-static-site.test.mjs
pnpm run build:site
```

Expected: checks PASS; combined artifact contains landing and app.

- [ ] **Step 7: Commit deployment packaging**

```powershell
git add scripts/build-static-site.mjs scripts/build-static-site.test.mjs package.json render.yaml .gitignore
git commit -m "build: prepara landing e aplicativo para Render"
```

### Task 10: Visual QA, Final Verification and Render Deployment

**Files:**
- Modify only files implicated by verified visual or functional defects.

**Interfaces:**
- Consumes: local combined artifact and Render service configuration.
- Produces: verified public landing URL and `/app/` URL.

- [ ] **Step 1: Start local servers**

Run the Vite app and serve `site-dist` locally after `pnpm run build:site`. Keep both URLs available during QA.

- [ ] **Step 2: Compare all 13 referenced screens at 414 × 896**

Check composition, curve placement, card proportions, title hierarchy, image crops and bottom navigation against each rendered SVG. Correct only discrepancies that materially reduce fidelity.

- [ ] **Step 3: Test new screens at 414 × 896**

Validate Saúde, Relatórios, Carrinho, Planos and Institucional for the same visual grammar and for zero horizontal overflow.

- [ ] **Step 4: Test desktop behavior at 1280 × 720**

Confirm centered 480 px application, hidden closed drawer, internal drawer scrolling, keyboard focus and no global horizontal overflow.

- [ ] **Step 5: Exercise critical flows**

Test login, registration, protected redirect, appointment creation, diary entry, health check-in, emergency edit, Bloomie urgent response, favorites, cart quantity, simulated checkout, plan selection and institutional interest.

- [ ] **Step 6: Run final verification**

Run:

```powershell
pnpm --dir app check
node --test scripts/build-static-site.test.mjs
pnpm run build:site
git diff --check
git status -sb
```

Expected: all tests, lint and builds PASS; no whitespace errors; only intended files changed.

- [ ] **Step 7: Commit verified corrections**

Stage only verified redesign files and commit with `fix: ajusta fidelidade visual e responsividade` if corrections were necessary. Skip the commit if the working tree is clean.

- [ ] **Step 8: Push redesign branch and open PR**

Push `feat/redesign-canva`. If PR #2 is merged, open against `main`; otherwise open a stacked PR against `feat/fase-4-loja-planos-b2g` and retarget it to `main` after merge.

- [ ] **Step 9: Deploy through the installed Render integration**

Create or update the MamaBloom Static Site from `render.yaml`, wait for build completion, and inspect deployment status. Do not expose credentials in logs or repository files.

- [ ] **Step 10: Validate production URLs**

Verify HTTP 200 for `/` and `/app/`, refresh at `/app/agenda`, confirm assets load, and exercise one protected-route login flow. Report the public URLs, deployed commit and any Render dashboard action still requiring user approval.
