import { describe, expect, it } from 'vitest'
import { addDays, getMonthGrid, toDateKey } from './date.js'

describe('datas do aplicativo', () => {
  it('gera chaves locais sem deslocamento de fuso', () => {
    expect(toDateKey(new Date(2026, 7, 7))).toBe('2026-08-07')
  })

  it('adiciona dias preservando uma data válida', () => {
    expect(toDateKey(addDays(new Date(2026, 7, 7), 3))).toBe('2026-08-10')
  })

  it('monta uma grade mensal em semanas completas', () => {
    const grid = getMonthGrid(2026, 7)
    expect(grid.length % 7).toBe(0)
    expect(grid.filter(Boolean)).toHaveLength(31)
  })
})
