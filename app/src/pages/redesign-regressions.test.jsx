import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/auth-context.js'
import DiaryPage from './DiaryPage.jsx'
import ProfilePage from './ProfilePage.jsx'

const authValue = {
  logout: vi.fn(),
  user: {
    name: 'Maria da Silva',
    identity: 'maria@example.com',
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
    window.localStorage.setItem('mamabloom:diary', JSON.stringify([
      { id: 'entry-latest', mood: 'feliz', text: 'Registro mais recente', date: '2026-08-07' },
    ]))

    renderPage(<DiaryPage />, '/diario')
    fireEvent.click(screen.getByRole('button', { name: 'Excluir registro mais recente' }))

    expect(JSON.parse(window.localStorage.getItem('mamabloom:diary'))).toEqual([])
    expect(screen.queryByText('Registro mais recente')).not.toBeInTheDocument()
  })

  it('mantém o acesso à Agenda no perfil', () => {
    renderPage(<ProfilePage />, '/perfil')

    expect(screen.getByRole('link', { name: /Agenda/ })).toHaveAttribute('href', '/agenda')
  })

  it('explica no perfil onde os dados são armazenados', () => {
    renderPage(<ProfilePage />, '/perfil')

    expect(screen.getByText('Privacidade nesta versão')).toBeInTheDocument()
    expect(screen.getByText(/armazenados localmente no navegador/i)).toBeInTheDocument()
  })

})
