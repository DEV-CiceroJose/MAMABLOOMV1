import { describe, expect, it } from 'vitest'
import {
  isAdultEnough,
  isNotFutureDate,
  isValidEmail,
  isValidIdentity,
  isValidPassword,
  onlyDigits,
} from './validation.js'

describe('validação dos formulários', () => {
  it('normaliza e aceita CPF com máscara', () => {
    expect(onlyDigits('123.456.789-00')).toBe('12345678900')
    expect(isValidIdentity('123.456.789-00')).toBe(true)
  })

  it('aceita e-mail e rejeita identificador incompleto', () => {
    expect(isValidEmail('maria@example.com')).toBe(true)
    expect(isValidIdentity('maria@example.com')).toBe(true)
    expect(isValidIdentity('1234')).toBe(false)
  })

  it('exige senha de pelo menos seis caracteres', () => {
    expect(isValidPassword('123456')).toBe(true)
    expect(isValidPassword('123')).toBe(false)
  })

  it('valida idade mínima e datas futuras', () => {
    expect(isAdultEnough('1994-05-12')).toBe(true)
    expect(isAdultEnough(new Date().toISOString().slice(0, 10))).toBe(false)
    expect(isNotFutureDate('2020-01-01')).toBe(true)
    expect(isNotFutureDate('2999-01-01')).toBe(false)
  })
})
