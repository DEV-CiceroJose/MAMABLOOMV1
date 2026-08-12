import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/auth-context.js'
import DiaryPage from './DiaryPage.jsx'
import ProfilePage from './ProfilePage.jsx'

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

})
