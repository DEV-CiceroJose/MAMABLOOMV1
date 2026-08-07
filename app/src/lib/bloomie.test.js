import { describe, expect, it } from 'vitest'
import { createBloomieReply } from './bloomie.js'

describe('createBloomieReply', () => {
  it('orienta atendimento profissional diante de termos urgentes', () => {
    const reply = createBloomieReply('Estou com sangramento e dor forte')
    expect(reply.tone).toBe('urgent')
    expect(reply.text).toContain('serviço de emergência')
  })

  it('oferece acolhimento sem diagnóstico para emoções difíceis', () => {
    const reply = createBloomieReply('Hoje estou muito ansiosa')
    expect(reply.tone).toBe('support')
    expect(reply.text).toContain('equipe de pré-natal')
  })

  it('mantém a resposta geral dentro do escopo', () => {
    expect(createBloomieReply('Quero organizar minha semana').tone).toBe('general')
  })
})
