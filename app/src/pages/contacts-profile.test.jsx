import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { AuthContext } from '../context/auth-context.js'

const user = { id: 'contact-test', name: 'Maria Silva', email: 'maria@example.com', birthDate: '2000-05-20', pregnancy: { weeks: 12 } }
function renderRoute(route, extra = {}) {
  return render(<MemoryRouter initialEntries={[route]}><AuthContext.Provider value={{ user, logout: vi.fn(), ...extra }}><App /></AuthContext.Provider></MemoryRouter>)
}
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

it('abre o cadastro de conhecidos pelos dois atalhos de apoio, sem alterar o cartão de emergência', () => {
  const emergencyKey = 'mamabloom:user:contact-test:emergency-card'
  localStorage.setItem(emergencyKey, JSON.stringify({ contactName: 'Emergência', contactPhone: '85988887777' }))
  renderRoute('/apoio')
  const addLinks = screen.getAllByRole('link', { name: /Adicionar apoio/ })
  expect(addLinks).toHaveLength(2)
  expect(addLinks[0].getAttribute('href')).toBe(addLinks[1].getAttribute('href'))
  fireEvent.click(addLinks[1])
  fireEvent.change(screen.getByLabelText('Nome do contato'), { target: { value: 'Ana Santos' } })
  fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '(85) 99999-1234' } })
  fireEvent.change(screen.getByLabelText('Vínculo'), { target: { value: 'Amigo(a)' } })
  fireEvent.click(screen.getByRole('button', { name: 'Salvar contato' }))
  expect(screen.getByRole('link', { name: /Ligar para Ana Santos/ })).toHaveAttribute('href', 'tel:85999991234')
  expect(within(screen.getByRole('region', { name: 'Sua rede de apoio' })).getByText('Amigo(a)')).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(emergencyKey))).toEqual({ contactName: 'Emergência', contactPhone: '85988887777' })
  cleanup()
  renderRoute('/apoio/contatos')
  expect(screen.getByText('Ana Santos')).toBeInTheDocument()
})

it('recusa contato sem nome, telefone válido ou vínculo', () => {
  renderRoute('/apoio/contatos')
  fireEvent.click(screen.getByRole('button', { name: 'Salvar contato' }))
  expect(screen.getByText('Informe o nome do contato.')).toBeInTheDocument()
  expect(screen.getByText('Informe um telefone com DDD válido.')).toBeInTheDocument()
  expect(screen.getByText('Escolha o vínculo com essa pessoa.')).toBeInTheDocument()
  expect(localStorage.getItem('mamabloom:user:contact-test:trusted-contacts')).toBeNull()
})

it('edita e permite desfazer a remoção de um contato sem duplicar a lista', () => {
  const storageKey = 'mamabloom:user:contact-test:trusted-contacts'
  localStorage.setItem(storageKey, JSON.stringify([{ id: 'ana', name: 'Ana', phone: '85999991234', relationship: 'Familiar' }]))
  renderRoute('/apoio/contatos')
  fireEvent.click(screen.getByRole('button', { name: 'Editar Ana' }))
  fireEvent.change(screen.getByLabelText('Vínculo'), { target: { value: 'Amigo(a)' } })
  fireEvent.click(screen.getByRole('button', { name: 'Salvar contato' }))
  expect(JSON.parse(localStorage.getItem(storageKey))).toEqual([{ id: 'ana', name: 'Ana', phone: '85999991234', relationship: 'Amigo(a)' }])
  fireEvent.click(screen.getByRole('button', { name: 'Remover Ana' }))
  expect(screen.queryByRole('link', { name: 'Ligar para Ana' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }))
  expect(screen.getByRole('link', { name: 'Ligar para Ana' })).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(storageKey))).toHaveLength(1)
})

it('mantém gestação informativa e abre a edição dos dados pessoais no perfil', () => {
  renderRoute('/perfil')
  expect(screen.queryByRole('link', { name: /Gestação em acompanhamento/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Editar informações' }))
  const form = screen.getByRole('form', { name: 'Editar informações' })
  expect(within(form).getByLabelText('Nome completo')).toHaveValue('Maria Silva')
  expect(within(form).getByLabelText('E-mail')).toHaveValue('maria@example.com')
  fireEvent.click(within(form).getByRole('button', { name: 'Cancelar' }))
  expect(screen.queryByRole('form', { name: 'Editar informações' })).not.toBeInTheDocument()
})

it('encerra a opção de desfazer após salvar um substituto numa rede cheia', () => {
  const storageKey = 'mamabloom:user:contact-test:trusted-contacts'
  localStorage.setItem(storageKey, JSON.stringify(Array.from({ length: 100 }, (_, index) => ({ id: String(index), name: `Pessoa ${index}`, phone: '85999991234', relationship: 'Familiar' }))))
  renderRoute('/apoio/contatos')
  fireEvent.click(screen.getByRole('button', { name: 'Remover Pessoa 0', exact: true }))
  fireEvent.change(screen.getByLabelText('Nome do contato'), { target: { value: 'Nova pessoa' } })
  fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '85999991234' } })
  fireEvent.change(screen.getByLabelText('Vínculo'), { target: { value: 'Amigo(a)' } })
  fireEvent.click(screen.getByRole('button', { name: 'Salvar contato' }))
  expect(screen.queryByRole('button', { name: 'Desfazer' })).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(storageKey))).toHaveLength(100)
}, 15000)
