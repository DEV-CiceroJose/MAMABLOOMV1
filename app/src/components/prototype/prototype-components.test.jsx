import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import CanvaCard from './CanvaCard.jsx'
import PrototypeBottomNav from './PrototypeBottomNav.jsx'
import PrototypeHeader from './PrototypeHeader.jsx'

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
})
