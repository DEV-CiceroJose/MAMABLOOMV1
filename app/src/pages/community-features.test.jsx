import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { AuthContext } from '../context/auth-context.js'
import { communityApi } from '../lib/api.js'
import { dailyArticle } from '../data/articles.js'

const user = { id: 'patient', name: 'Maria Teste', email: 'maria@example.com', birthDate: '1995-05-15', pregnancy: { babyName: 'Luna', weeks: 20 } }
function open(route, extra = {}) { return render(<MemoryRouter initialEntries={[route]}><AuthContext.Provider value={{ user, logout: vi.fn(), ...extra }}><App /></AuthContext.Provider></MemoryRouter>) }
beforeEach(() => { vi.spyOn(communityApi, 'get').mockImplementation(async (path) => path === '/consultations' ? { consultations: [] } : path === '/professionals' ? { professionals: [] } : { role: 'patient', professional: null }) })
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

it('a legenda do bebê permite salvar o nome na conta e cancelar sem alteração', async () => {
  const updateProfile = vi.fn().mockResolvedValue({})
  open('/inicio', { updateProfile })
  fireEvent.click(await screen.findByRole('button', { name: 'Editar nome do bebê' }))
  fireEvent.change(screen.getByLabelText('Nome do bebê'), { target: { value: 'Aurora' } })
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(updateProfile).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Editar nome do bebê' }))
  fireEvent.change(screen.getByLabelText('Nome do bebê'), { target: { value: 'Aurora' } })
  fireEvent.click(screen.getByRole('button', { name: 'Salvar nome' }))
  expect(await screen.findByText('Nome do bebê atualizado.')).toBeInTheDocument()
  expect(updateProfile).toHaveBeenCalledWith({ name: user.name, email: user.email, birthDate: user.birthDate, babyName: 'Aurora' })
})

it('a leitura diária abre o artigo compartilhado da home', async () => {
  open('/inicio')
  await screen.findByRole('heading', { name: 'Faça a leitura do dia!' })
  expect(screen.queryByRole('heading', { name: 'Artigos para você' })).not.toBeInTheDocument()
  const link = screen.getAllByRole('link').find((item) => item.classList.contains('home-prototype__reading'))
  expect(link).toHaveAttribute('href', `/artigos/${dailyArticle().id}`)
  fireEvent.click(link)
  expect(await screen.findByRole('heading', { level: 1, name: dailyArticle().title })).toBeInTheDocument()
  expect(screen.getByText(dailyArticle().conclusion)).toBeInTheDocument()
})

it('a leitura diária só muda na virada do dia em São Paulo', () => {
  expect(dailyArticle(new Date('2026-11-23T02:59:00Z')).id).not.toBe(dailyArticle(new Date('2026-11-23T03:00:00Z')).id)
  expect(dailyArticle(new Date('2026-11-23T03:00:00Z')).id).toBe(dailyArticle(new Date('2026-11-24T02:59:00Z')).id)
})

it('escolhe o psicólogo, seleciona o dia e confirma um horário disponível', async () => {
  const startsAt = new Date(Date.now() + 86400000).toISOString()
  const endsAt = new Date(Date.now() + 89400000).toISOString()
  communityApi.get.mockImplementation(async (path) => path === '/professionals' ? { professionals: [{ userId: 'pro', name: 'Psicóloga Teste', age: 35, registration: 'CRP TESTE', education: 'Formação', experience: 'Experiência', specialties: 'Maternidade', bio: 'Apresentação' }] } : path === '/slots/pro' ? { slots: [{ id: 'slot', startsAt, endsAt }] } : path === '/consultations' ? { consultations: [] } : { role: 'patient' })
  const post = vi.spyOn(communityApi, 'post').mockResolvedValue({ id: 'booking' })
  open('/psicologia')
  expect(await screen.findByText('35 anos · CRP TESTE')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Ver dias e horários' }))
  const booking = await screen.findByRole('region', { name: 'Agenda de Psicóloga Teste' })
  await waitFor(() => expect(within(booking).getAllByRole('button').length).toBeGreaterThan(0))
  fireEvent.click(within(booking).getAllByRole('button')[0])
  fireEvent.click(within(booking).getAllByRole('button')[1])
  fireEvent.click(within(booking).getByRole('button', { name: 'Confirmar agendamento' }))
  expect(await screen.findByText(/Consulta agendada/)).toBeInTheDocument()
  expect(post).toHaveBeenCalledWith('/consultations', { slotId: 'slot' })
})

it('administração bloqueada redireciona a paciente para sua área', async () => {
  open('/administracao')
  expect(await screen.findByRole('heading', { name: 'LUNA' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Aprovar cadastro' })).not.toBeInTheDocument()
})

it('administração mostra apenas o painel e a opção de sair', async () => {
  communityApi.get.mockImplementation(async (path) => path === '/me' ? { role: 'admin', professional: null } : { companies: [], professionals: [], reviews: [] })
  open('/administracao')
  expect(await screen.findByRole('heading', { name: 'Administração' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Central de apoio' })).not.toBeInTheDocument()
  expect(screen.queryByRole('navigation', { name: 'Navegação principal do aplicativo' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('link', { name: 'Administração' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Agenda' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeInTheDocument()
})

it('psicóloga volta ao próprio painel ao abrir uma área da paciente', async () => {
  communityApi.get.mockImplementation(async (path) => path === '/me' ? { role: 'professional', professional: null } : path === '/consultations' ? { consultations: [] } : { slots: [] })
  open('/inicio')
  expect(await screen.findByRole('heading', { name: 'Meu painel profissional' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'LUNA' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Central de apoio' })).not.toBeInTheDocument()
  expect(screen.queryByRole('navigation', { name: 'Navegação principal do aplicativo' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('link', { name: 'Meu painel profissional' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Diário gestacional' })).not.toBeInTheDocument()
})

it('psicologia apresenta navegação contextual sem links profissionais soltos', async () => {
  open('/psicologia')
  expect(await screen.findByRole('heading', { name: 'Encontre seu psicólogo' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Central de apoio' })).toHaveClass('community-back')
  expect(screen.getByRole('link', { name: /Ver minhas consultas/ })).toHaveClass('button')
  expect(screen.queryByRole('link', { name: /Sou psicólogo/ })).not.toBeInTheDocument()
})

it('consulta na agenda aponta para o atendimento em vez de criar compromisso editável duplicado', async () => {
  const startsAt = new Date(Date.now() + 86400000).toISOString()
  communityApi.get.mockImplementation(async (path) => path === '/consultations' ? { consultations: [{ id: 'booking', startsAt, endsAt: startsAt, professionalId: 'pro', professionalName: 'Psicóloga Teste', patientId: user.id, status: 'confirmed' }] } : { role: 'patient' })
  open('/agenda')
  expect(await screen.findByRole('link', { name: 'Ver consulta' })).toHaveAttribute('href', '/psicologia#minhas-consultas')
  expect(screen.queryByRole('button', { name: 'Excluir Psicologia · Psicóloga Teste' })).not.toBeInTheDocument()
})
