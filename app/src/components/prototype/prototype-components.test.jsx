import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AuthFrame from '../AuthFrame.jsx'
import CanvaCard from './CanvaCard.jsx'
import PrototypeBottomNav from './PrototypeBottomNav.jsx'
import PrototypeHeader from './PrototypeHeader.jsx'
import PrototypeToolbar from './PrototypeToolbar.jsx'

describe('componentes visuais do protótipo', () => {
  it('renderiza o cabeçalho curvo com busca acessível', () => {
    render(<MemoryRouter><PrototypeHeader title="ALÍCIA" search /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'ALÍCIA' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Pesquisar' })).toBeInTheDocument()
  })

  it('renderiza os três destinos da navegação inferior', () => {
    render(<MemoryRouter><PrototypeBottomNav tone="aqua" /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/inicio')
    expect(screen.getByRole('link', { name: 'Bloomie' })).toHaveAttribute('href', '/bloomie')
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil')
  })

  it('aplica o tom solicitado ao card do Canva', () => {
    render(<CanvaCard tone="yellow">Conteúdo</CanvaCard>)
    expect(screen.getByText('Conteúdo')).toHaveClass('canva-card--yellow')
  })

  it('usa a composição curva do Canva nas telas de autenticação', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthFrame title="Login" subtitle="Acesse sua conta.">
          <span>Formulário</span>
        </AuthFrame>
      </MemoryRouter>,
    )

    expect(container.querySelector('.auth-screen--canva')).toBeInTheDocument()
    expect(container.querySelector('.auth-curve__accent')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })

  it('oferece busca, configurações e menu na barra do protótipo', () => {
    const view = render(<MemoryRouter><PrototypeToolbar search onMenu={() => {}} /></MemoryRouter>)
    const toolbar = within(view.container)

    expect(toolbar.getByRole('searchbox', { name: 'Pesquisar' })).toBeInTheDocument()
    expect(toolbar.getByRole('link', { name: 'Configurações' })).toHaveAttribute('href', '/perfil')
    expect(toolbar.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument()
  })
})
