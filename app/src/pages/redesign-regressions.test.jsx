import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/auth-context.js'
import BloomiePage from './BloomiePage.jsx'
import DiaryPage from './DiaryPage.jsx'
import HomePreviewPage from './HomePreviewPage.jsx'
import PlansPage from './PlansPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import ShopPage from './ShopPage.jsx'
import SupportPage from './SupportPage.jsx'

const authValue = {
  logout: vi.fn(),
  user: {
    id: 'user-a',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    pregnancy: { weeks: 21 },
  },
}

function renderPage(page, route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={authValue}>{page}</AuthContext.Provider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('regressões do redesign', () => {
  it('permite excluir o registro mais recente do diário', () => {
    const diaryKey = 'mamabloom:user:user-a:diary'
    window.localStorage.setItem(diaryKey, JSON.stringify([
      { id: 'entry-latest', mood: 'feliz', text: 'Registro mais recente', date: '2026-08-07' },
    ]))

    renderPage(<DiaryPage />, '/diario')
    fireEvent.click(screen.getByRole('button', { name: 'Excluir registro mais recente' }))

    expect(JSON.parse(window.localStorage.getItem(diaryKey))).toEqual([])
    expect(screen.queryByText('Registro mais recente')).not.toBeInTheDocument()
  })

  it('mantém o acesso à Agenda no perfil', () => {
    renderPage(<ProfilePage />, '/perfil')

    expect(screen.getByRole('link', { name: /Agenda/ })).toHaveAttribute('href', '/agenda')
  })

  it('mostra a conta e explica a sincronização segura no perfil', () => {
    renderPage(<ProfilePage />, '/perfil')

    expect(screen.getByText('maria@example.com')).toBeInTheDocument()
    expect(screen.getByText('Privacidade e sincronização')).toBeInTheDocument()
    expect(screen.getByText(/sincronizados com segurança/i)).toBeInTheDocument()
  })

  it('não exibe dados locais pertencentes a outra conta', () => {
    window.localStorage.setItem('mamabloom:user:user-b:diary', JSON.stringify([
      { id: 'private-entry', mood: 'feliz', text: 'Registro privado de outra conta', date: '2026-08-07' },
    ]))

    renderPage(<DiaryPage />, '/diario')

    expect(screen.queryByText('Registro privado de outra conta')).not.toBeInTheDocument()
  })

  it('transforma o banner retangular da loja em atalho para Apoio e separa suas ações', () => {
    const { container } = renderPage(<ShopPage />, '/loja')

    expect(screen.getByRole('link', { name: 'Ir para a Central de apoio' })).toHaveAttribute('href', '/apoio')
    const favorite = screen.getByRole('button', { name: 'Adicionar Perfume dos favoritos' })
    const addToCart = screen.getByRole('button', { name: 'Adicionar Perfume ao carrinho' })
    expect(favorite).not.toBe(addToCart)
    expect(favorite.closest('footer')).toBe(addToCart.closest('footer'))
    expect(container.querySelector('.shop-prototype__promo')).toBeInTheDocument()
  })

  it('oferece anexo de imagem e mantém o texto do protótipo no Diário', async () => {
    renderPage(<DiaryPage />, '/diario')
    fireEvent.click(screen.getByRole('button', { name: /Escrever um novo/ }))

    expect(screen.getByPlaceholderText('Este é um espaço só seu...')).toBeInTheDocument()
    const attachmentInput = screen.getByLabelText('Anexar imagem')
    expect(attachmentInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    fireEvent.change(attachmentInput, { target: { files: [new File(['imagem'], 'registro.png', { type: 'image/png' })] } })
    expect(await screen.findByAltText('Prévia da imagem selecionada')).toBeInTheDocument()
  })

  it('mantém texto e imagem da Bloomie em um agrupamento com espaçamento próprio', () => {
    renderPage(<BloomiePage />, '/bloomie')

    const copy = screen.getByText('Tire suas dúvidas sobre a maternidade aqui comigo!')
    expect(copy.closest('.bloomie-prototype__character')).toContainElement(screen.getByAltText('Bloomie, assistente virtual do MamaBloom'))
  })

  it('mostra ausência de apoio e abre uma conversa a partir da lista', () => {
    const { container } = renderPage(<SupportPage />, '/apoio')

    expect(screen.getByRole('heading', { name: 'Sem apoio cadastrado' })).toBeInTheDocument()
    const therapy = screen.getByRole('button', { name: /Agende uma sessão/ })
    expect(therapy.querySelector('img')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir conversa com Andréia Martins' }))
    expect(screen.getByRole('heading', { name: 'Andréia Martins' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Mensagem para Andréia Martins' })).toBeInTheDocument()
    expect(container.querySelector('.support-prototype__suggested-avatar-frame')).toBeInTheDocument()
    expect(container.querySelector('.support-prototype__suggested-avatar > span')).toHaveAttribute('aria-hidden', 'true')
  })

  it('remove o plano Família e identifica Alicia como a bebê', () => {
    const { rerender } = renderPage(<PlansPage />, '/planos')
    expect(screen.queryByText('Família')).not.toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={['/inicio']}>
        <AuthContext.Provider value={authValue}><HomePreviewPage /></AuthContext.Provider>
      </MemoryRouter>,
    )
    expect(screen.getByText('Alicia')).toBeInTheDocument()
    expect(screen.getByAltText('Ilustração do desenvolvimento de Alicia')).toBeInTheDocument()
  })

})
