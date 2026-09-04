import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { AuthContext } from '../context/auth-context.js'

const user = { id: 'memories-test', name: 'Brenda Laís', email: 'brenda@example.com', pregnancy: { weeks: 12, babyName: 'Luna' } }
function open(route, account = user) {
  return render(<MemoryRouter initialEntries={[route]}><AuthContext.Provider value={{ user: account, logout: vi.fn() }}><App /></AuthContext.Provider></MemoryRouter>)
}
afterEach(() => { cleanup(); localStorage.clear() })

it('personaliza o início com o bebê sem usar o nome da mãe ou um nome fixo', () => {
  open('/inicio')
  expect(screen.getByRole('heading', { name: 'LUNA' })).toBeInTheDocument()
  expect(screen.getByAltText('Ilustração do desenvolvimento de Luna')).toBeInTheDocument()
  expect(screen.queryByText('Alicia')).not.toBeInTheDocument()
})

it('usa um texto neutro quando a conta antiga ainda não informou o bebê', () => {
  open('/inicio', { ...user, pregnancy: { weeks: 12 } })
  expect(screen.getByRole('heading', { name: 'MEU BEBÊ' })).toBeInTheDocument()
})

it('abre a Central de apoio pela abelha do diário', () => {
  open('/diario')
  fireEvent.click(screen.getByRole('link', { name: 'Ir para a Central de apoio' }))
  expect(screen.getByRole('heading', { name: /Precisando de apoio/ })).toBeInTheDocument()
})

it('permite escolher o plano com os benefícios anteriores e psicólogos parceiros', () => {
  open('/planos')
  const card = screen.getByRole('heading', { name: 'Acolher' }).closest('article')
  expect(within(card).getByText(/Tudo do Essencial e do Florescer/)).toBeInTheDocument()
  expect(within(card).getByText(/Psicólogos parceiros/)).toBeInTheDocument()
  expect(within(card).getByText('Valor a definir')).toBeInTheDocument()
  fireEvent.click(within(card).getByRole('button', { name: 'Escolher plano' }))
  expect(JSON.parse(localStorage.getItem('mamabloom:user:memories-test:selected-plan'))).toBe('acolher')
})

it('o caderno abre as memórias e permite folhear os textos e fotos de registros anteriores', () => {
  localStorage.setItem('mamabloom:user:memories-test:diary', JSON.stringify([
    { id: 'recent', date: '2026-09-04', text: 'Hoje senti o primeiro chute.', image: 'data:image/png;base64,bmV3', mood: 'feliz' },
    { id: 'old', date: '2026-08-01', text: 'Nossa primeira foto.', image: 'data:image/png;base64,b2xk', mood: 'bem' },
  ]))
  open('/diario')
  fireEvent.click(screen.getByRole('link', { name: 'Abrir meu diário' }))
  expect(screen.getByRole('heading', { name: 'Meu diário' })).toBeInTheDocument()
  expect(screen.getByText('Hoje senti o primeiro chute.')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Foto deste registro' })).toHaveAttribute('src', 'data:image/png;base64,bmV3')
  fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }))
  expect(screen.getByText('Nossa primeira foto.')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Foto deste registro' })).toHaveAttribute('src', 'data:image/png;base64,b2xk')
  expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
  expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
})

it('abre um diário vazio com acesso para escrever a primeira memória', () => {
  open('/diario/memorias')
  fireEvent.click(screen.getByRole('link', { name: 'Escrever minha primeira memória' }))
  expect(screen.getByRole('textbox', { name: 'Querido diário,' })).toBeInTheDocument()
})

it('o adicionar fora do avatar abre uma conversa com o perfil sugerido', () => {
  open('/apoio')
  fireEvent.click(screen.getByRole('button', { name: 'Conversar com Ana Beatriz' }))
  expect(screen.getByRole('textbox', { name: 'Mensagem para Ana Beatriz' })).toBeInTheDocument()
})
