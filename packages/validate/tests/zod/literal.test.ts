import { describe, it, expect } from 'vitest'
import {
  vAny,
  vLiteral,
  vNaN,
  vNever,
  vNull,
  vNullish,
  vUndefined,
  vUnknown,
} from '../../src/types/init'

const literalTuna = vLiteral('tuna' as const)
const literalFortyTwo = vLiteral(42 as const)
const literalFortyTwoN = vLiteral(42n as const)
const literalTrue = vLiteral(true as const)
const literalInfinity = vLiteral(Infinity)
const literalNInfinity = vLiteral(-Infinity)

const terrificSymbol = Symbol('terrific')
const literalTerrificSymbol = vLiteral(terrificSymbol)

const anyObject = { a: 1 }
const literalObject = vLiteral(anyObject)

const literalNaN = vNaN()
const literalUndefined = vUndefined()
const literalNull = vNull()
const literalNullish = vNullish()
const literalAny = vAny()
const literalUnknown = vUnknown()
const literalNever = vNever()

describe('adapted from zod literals', () => {
  it('passing validations', () => {
    literalTuna.parse('tuna')
    literalFortyTwo.parse(42)
    literalFortyTwoN.parse(42n)
    literalTrue.parse(true)
    literalTerrificSymbol.parse(terrificSymbol)
    literalObject.parse(anyObject)
    literalNaN.parse(NaN)
    literalUndefined.parse(undefined)
    literalNull.parse(null)
    literalNullish.parse(null)
    literalNullish.parse(undefined)
    literalAny.parse(NaN)
    literalUnknown.parse(NaN)
    literalInfinity.parse(Infinity)
    literalNInfinity.parse(-Infinity)
  })
  it('types', () => {
    expect(literalTuna.type).toEqual('"tuna"')
    expect(literalFortyTwo.type).toEqual('42')
    expect(literalFortyTwoN.type).toEqual('42')
    expect(literalTerrificSymbol.type).toEqual('Symbol(terrific)')
    expect(literalObject.type).toEqual('{"a":1}')
    expect(literalNaN.type).toEqual('NaN')
    expect(literalUndefined.type).toEqual('undefined')
    expect(literalAny.type).toEqual('any')
    expect(literalUnknown.type).toEqual('unknown')
    expect(literalNull.type).toEqual('null')
    expect(literalNullish.type).toEqual('null|undefined')
    expect(literalTrue.type).toEqual('true')
    expect(literalInfinity.type).toEqual('Infinity')
    expect(literalNInfinity.type).toEqual('-Infinity')
  })

  it('failing validations', () => {
    expect(() => literalTuna.parse('shark')).toThrow()
    expect(() => literalFortyTwo.parse(43)).toThrow()
    expect(() => literalFortyTwoN.parse(42)).toThrow()
    expect(() => literalTrue.parse(false)).toThrow()
    expect(() => literalTerrificSymbol.parse(Symbol('terrific'))).toThrow()
    expect(() => literalObject.parse({ a: 1 })).toThrow()
    expect(() => literalNaN.parse(true)).toThrow()

    expect(() => literalUndefined.parse(true)).toThrow()
    expect(() => literalNull.parse(true)).toThrow()
    expect(() => literalNullish.parse(true)).toThrow()
    expect(() => literalNever.parse('never')).toThrow()
    expect(() => literalInfinity.parse(1)).toThrow()
    expect(() => literalNInfinity.parse(1)).toThrow()
  })

  it('invalid_literal should have `received` field with data', () => {
    const data = 'shark'
    const result = literalTuna.safeParse(data)
    if (result[0] !== undefined) {
      const issue = result[0].errors[0]
      if (issue === 'invalid_literal') expect(result[0].input).toBe(data)
    }
  })
})
