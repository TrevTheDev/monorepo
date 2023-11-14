/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { it, expect, describe } from 'vitest'
import {
  B,
  B1,
  C,
  I,
  K,
  KI,
  M,
  apply,
  becard,
  blackbird,
  bluebird,
  bluebirdPrime,
  bunting,
  cardinal,
  cardinalP,
  cardinalStar,
  cardinalStarStar,
  dickcissel,
  dove,
  dovekie,
  eagle,
  eagleBald,
  finch,
  finchStar,
  finchStarStar,
  goldFinch,
  hummingbird,
  idStar,
  idStarStar,
  identity,
  jalt,
  jaltPrime,
  jay,
  kestrel,
  kite,
  owl,
  phoenix,
  psi,
  quacky,
  queer,
  quirky,
  quixotic,
  quizzical,
  robin,
  robinStar,
  robinStarStar,
  starling,
  starlingPrime,
  thrush,
  vireo,
  vireoStar,
  vireoStarStar,
  warbler,
  warbler1,
  warblerStar,
  warblerStarStar,
} from '../src'

// type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false
// const checkType = <T>(arg: T) => arg
// const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

const f = (a) => `f${a}`
const g = (a) => `g${a}`
const h = (a) => `h${a}`
const f2 = (a) => (b) => `f2${a}${b}`
const g2 = (a) => (b) => `g2${a}${b}`
const h2 = (a) => (b) => `h2${a}${b}`
const f3 = (a) => (b) => (c) => `f2${a}${b}${c}`
const f4 = (a) => (b) => (c) => (d) => `f3${a}${b}${c}${d}`
describe('birds', () => {
  it('playcode', () => {
    console.log(`4: ${kestrel(4)(2)}`) // => 4
    console.log(`2: ${kite(4)(2)}`) // => 4
    // cardinal(console.log)('4')('4:') // => 4
    // cardinal(console.log, '4', '4:') // => 4

    const add = (a) => (b) => a + b

    const add3 = (x) => x + 3
    const double = (x) => x * 2

    const addThenDouble = B1(double)(add)
    console.log(addThenDouble(4)(7)) // 22;

    const doubleThenAdd3 = B(add3)(double)
    console.log(doubleThenAdd3(5)) // 13

    function toBool(fn: (a: boolean) => (b: boolean) => boolean) {
      return fn(true)(false)
    }
    const True = K
    const False = KI

    console.log(toBool(True))
    console.log(toBool(False))

    const not = C
    console.log('not', toBool(not(True)))
    console.log(toBool(not(False)))

    const ifThenElse = I

    console.log(ifThenElse(True)('It was true')('It was false')) // It was true
    console.log(ifThenElse(False)('It was true')('It was false')) // It was false

    const or = M
    console.log(toBool(or(True)(True))) // true
    console.log(toBool(or(False)(False))) // true

    const and = (p) => (q) => p(q)(p)

    console.log(toBool(and(True)(True))) // true
    console.log(toBool(and(False)(True))) // false
    console.log(toBool(and(True)(False))) // false
    console.log(toBool(and(False)(False))) // false

    const equals = (p) => (q) => p(q)(not(q))
    console.log(toBool(equals(True)(True))) // true
    console.log(toBool(equals(False)(True))) // false
    console.log(toBool(equals(True)(False))) // false
    console.log(toBool(equals(False)(False))) // true
  })
  it('idiot', () => expect(identity('b') === 'b').toEqual(true))

  it('kestrel', () => expect(kestrel('a')('b') === 'a').toBe(true))

  it('bluebird', () => {
    expect(f(g('a')) === bluebird(f)(g)('a')).toBe(true)
  })

  it('cardinal', () => {
    expect(f2('a')('b') === cardinal(f2)('b')('a')).toBe(true)
  })

  it('applicator', () => {
    expect(f('a') === apply(f)('a')).toBe(true)
  })

  it('psi', () => expect(f2(g('a'))(g('b')) === psi(f2)(g)('a')('b')).toBe(true))

  it('becard', () => expect(f(g(h('a'))) === becard(f)(g)(h)('a')).toBe(true))

  it('blackbird', () => expect(f(f2('a')('b')) === blackbird(f)(f2)('a')('b')).toBe(true))

  it('bluebird_', () => expect(f2('a')(g('b')) === bluebirdPrime(f2)('a')(g)('b')).toBe(true))

  it('bunting', () => expect(f(f3('a')('b')('c')) === bunting(f)(f3)('a')('b')('c')).toBe(true))

  it('cardinal_', () => expect(f2(g('b'))('a') === cardinalP(f2)(g)('a')('b')).toBe(true))

  it('cardinalstar', () => expect(f3('a')('c')('b') === cardinalStar(f3)('a')('b')('c')).toBe(true))

  it('cardinalstarstar', () =>
    expect(f4('a')('b')('d')('c') === cardinalStarStar(f4)('a')('b')('c')('d')).toBe(true))

  it('dove', () => expect(f2('a')(g('b')) === dove(f2)('a')(g)('b')).toBe(true))

  it('dickcissel', () =>
    expect(f3('a')('b')(g('c')) === dickcissel(f3)('a')('b')(g)('c')).toBe(true))

  it('dovekie', () => expect(f2(g('a'))(h('b')) === dovekie(f2)(g)('a')(h)('b')).toBe(true))

  it('eagle', () => expect(f2('a')(g2('b')('c')) === eagle(f2)('a')(g2)('b')('c')).toBe(true))

  it('eaglebald', () =>
    expect(f2(g2('a')('b'))(h2('c')('d')) === eagleBald(f2)(g2)('a')('b')(h2)('c')('d')).toBe(true))

  it('finch', () => expect(f2('b')('a') === finch('a')('b')(f2)).toBe(true))

  it('finchstar', () => expect(f3('c')('b')('a') === finchStar(f3)('a')('b')('c')).toBe(true))

  it('finchstarstar', () =>
    expect(f4('a')('d')('c')('b') === finchStarStar(f4)('a')('b')('c')('d')).toBe(true))

  it('goldfinch', () => expect(f2('b')(g('a')) === goldFinch(f2)(g)('a')('b')).toBe(true))

  it('hummingbird', () => expect(f3('a')('b')('a') === hummingbird(f3)('a')('b')).toBe(true))

  it('idstar', () => expect(f('a') === idStar(f)('a')).toBe(true))

  it('idstarstar', () => expect(f2('a')('b') === idStarStar(f2)('a')('b')).toBe(true))

  it('jalt', () => expect(f('a') === jalt(f)('a')('b')).toBe(true))

  it('jalt_', () => expect(f2('a')('b') === jaltPrime(f2)('a')('b')('c')).toBe(true))

  it('jay', () => expect(f2('a')(f2('c')('b')) === jay(f2)('a')('b')('c')).toBe(true))

  it('kite', () => expect(kite('a')('b') === 'b').toBe(true))

  it('owl', () => {
    const ffn = (fn) => (a) => fn(a)
    expect(g(ffn(g)) === owl(ffn)(g)).toBe(true)
  })

  it('phoenix', () => expect(f2(g('a'))(h('a')) === phoenix(f2)(g)(h)('a')).toBe(true))

  it('quacky', () => expect(g(f('a')) === quacky('a')(f)(g)).toBe(true))

  it('queer', () => expect(g(f('a')) === queer(f)(g)('a')).toBe(true))
  it('quirky', () => expect(g(f('a')) === quirky(f)('a')(g)).toBe(true))

  it('quixotic', () => expect(f(g('a')) === quixotic(f)('a')(g)).toBe(true))

  it('quizzical', () => expect(f(g('a')) === quizzical('a')(f)(g)).toBe(true))

  it('robin', () => expect(f2('b')('a') === robin('a')(f2)('b')).toBe(true))

  it('robinstar', () => expect(f3('b')('c')('a') === robinStar(f3)('a')('b')('c')).toBe(true))

  it('robinstarstar', () =>
    expect(f4('a')('c')('d')('b') === robinStarStar(f4)('a')('b')('c')('d')).toBe(true))

  it('starling', () => expect(f2('a')(g('a')) === starling(f2)(g)('a')).toBe(true))

  it('starling_', () => expect(f2(g('a'))(h('a')) === starlingPrime(f2)(g)(h)('a')).toBe(true))

  it('thrush', () => expect(f('a') === thrush('a')(f)).toBe(true))

  it('vireo', () => expect(f2('a')('b') === vireo('a')('b')(f2)).toBe(true))

  it('vireostar', () => expect(f3('b')('a')('c') === vireoStar(f3)('a')('b')('c')).toBe(true))

  it('vireostarstar', () =>
    expect(f4('a')('d')('b')('c') === vireoStarStar(f4)('a')('b')('c')('d')).toBe(true))

  it('warbler', () => expect(f2('a')('a') === warbler(f2)('a')).toBe(true))

  it('warbler1', () => expect(f2('a')('a') === warbler1('a')(f2)).toBe(true))

  it('warblerstar', () => expect(f3('a')('b')('b') === warblerStar(f3)('a')('b')).toBe(true))

  it('warblerstarstar', () =>
    expect(f4('a')('b')('c')('c') === warblerStarStar(f4)('a')('b')('c')).toBe(true))
})
