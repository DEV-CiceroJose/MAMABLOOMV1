import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import AppShell from './AppShell.jsx'

describe('AppShell no estilo Canva', () => {
  it('mantém o menu hambúrguer e usa a navegação inferior do protótipo', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/inicio']}>
        <AuthContext.Provider value={{ logout: vi.fn() }}>
          <AppShell><p>Conteúdo</p></AppShell>
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    expect(container.querySelector('.prototype-bottom-nav')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('complementary')).toHaveClass('app-drawer--open')
    expect(screen.getByRole('link', { name: /Agenda/ })).toBeInTheDocument()
  })
})
