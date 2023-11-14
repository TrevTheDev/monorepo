/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * haskell: id, ramda: identity, sanctuary: I
 *
 * λa.a
 */
export function identity<A>(a: A): A {
  return a
}
export const I = identity

/**
 * kestrel :: a -> b -> a
 * haskell: const, ramda: always, sanctuary: K
 *
 * λab.a
 */
export function kestrel<A>(a: A) {
  return <B>(_b: B) => a
}
export const K = kestrel

/**
 * kite :: a -> b -> b
 *
 * λab.b or KI or CK
 */
export function kite<A>(_a: A) {
  return function kite2<B>(b: B) {
    return b
  }
}
export const KI = kite
/**
 * cardinal :: (a -> b -> c) -> b -> a -> c
 *
 * haskell: flip, ramda: flip, sanctuary: flip
 *
 * Use: reverse arguments.
 * λfab.fba
 */
export function cardinal<A, B, C, T extends (a: A) => (b: B) => C>(fnAB2C: T): (b: B) => (a: A) => C
export function cardinal<A, B, C>(fnAB2C: (a: A) => (b: B) => C) {
  return (b: B) => (a: A) => fnAB2C(a)(b)
}
export const C = cardinal

/**
 * Mockingbird combinator. Use: self-application.
 *
 * λf.ff
 */
export function mockingbird<T>(fn: (a: any) => T) {
  return fn(fn)
}
export const M = mockingbird

// <C, D>(fnC2D: (c: C) => D) => <A, B>(fnAB2C: (a: A) => (b: B) => C) => (a: A) => (b: B) => D
// type BlueBird = <B, C>(fnB2C: (b: B) => C) => <A>(fnA2B: (a: A) => B) => (a: A) => C

/**
 * bluebird :: (b -> c) -> (a -> b) -> a -> c
 * haskell: (.),fmap, ramda: map, sanctuary: compose, map
 *
 * Use: 1 <- 1 composition.
 *
 * λfga.f(ga)
 */
export function bluebird<T extends (b: any) => any>(
  fnB2C: T,
): <S extends (a: any) => Parameters<T>[0]>(fnA2B: S) => (a: Parameters<S>[0]) => ReturnType<T>
export function bluebird<B, C>(fnB2C: (b: B) => C): <A>(fnA2B: (a: A) => B) => (a: A) => C
export function bluebird(fnB2C: (b: any) => any): (fnA2B: (a: any) => any) => (a: any) => any {
  return function bluebirdFn0(fnA2B: (a: any) => any) {
    return (a: any) => fnB2C(fnA2B(a))
  }
}
export const B = bluebird

/**
 * thrush :: a -> (a -> b) -> b
 *
 * haskell: (&), ramda: applyTo, sanctuary: T
 *
 * Haskell (#) in Peter Thiemann's Wash, reverse application.
 *
 * Use: hold an argument.
 *
 * λaf.fa or CI
 */
export function thrush<A>(a: A): <B>(fnA2B: (a: A) => B) => B {
  return function thrush2<B>(fnA2B: (a: A) => B): B {
    return fnA2B(a)
  }
}
export const T = thrush

/**
 * vireo :: a -> b -> (a -> b -> c) -> c
 *
 * Use: hold a pair of arguments.
 *
 * λabf.fab or BCT
 */
export function vireo<A>(a: A) {
  return function vireo2<B>(b: B) {
    return function vireo3<C>(fnAB2C: (a: A) => (b: B) => C) {
      return fnAB2C(a)(b)
    }
  }
}
export const V = vireo

const pair = V
const first = (a) => a(K) // Kestrel is a function which takes 2 arguments and selects the first.
const second = (a) => a(KI) // Kite is a function which takes 2 arguments and selects the second.

const myPair = pair(3)(4)
console.log(first(myPair)) // 3
console.log(second(myPair)) // 4

// const blackbird = f => g => a => b => f(g(a)(b));
// <FIn, F extends (input: FIn) => any>(f: F): <A, B, G extends (a: A) => (b: B) => FIn>(g: G) => (a: A) => (b: B) => any
// type BlackBird = <C, D>(
//   fnC2D: (c: C) => D,
// ) => <A, B>(fnAB2C: (a: A) => (b: B) => C) => (a: A) => (b: B) => D

/**
 * blackbird :: (c -> d) -> (a -> b -> c) -> a -> b -> d
 *
 * Use: 1 <- 2 composition.
 *
 * λfgab.f(gab) or BBB
 */
export function blackbird<C, D>(fnC2D: (c: C) => D) {
  return function blackbird2<A, B>(fnAB2C: (a: A) => (b: B) => C) {
    return (a: A) => (b: B) => fnC2D(fnAB2C(a)(b))
  }
}
export const B1 = blackbird
// const B1v2 = B(B)(B)

// starling :: (a -> b -> c) -> (a -> b) -> a -> c
/**
 * haskell: ap - Applicative's (<*>) on functions., ramda: ap, sanctuary: ap
 */
export function starling<A, B, C>(fnAB2C: (a: A) => (b: B) => C) {
  return function starling1(fnA2B: (a: A) => B) {
    return (a: A) => fnAB2C(a)(fnA2B(a))
  }
}
export const S = starling

/**
 * psi :: (b -> b -> c) -> (a -> b) -> a -> a -> c
 * haskell: on, ramda: , sanctuary: on
 */
export function psi<B, C>(fBB2C: (b: B) => (b: B) => C) {
  return function getFA2B<A>(fA2B: (a: A) => B) {
    return (a1: A) => (a2: A) => fBB2C(fA2B(a1))(fA2B(a2))
  }
}
export const P = psi

/**
 * applicator :: (a -> b) -> a -> b
 * haskell: ($), ramda: call, sanctuary: A
 * applicator, i-star
 */
export function apply<A, B>(fA2B: (a: A) => B) {
  return (a: A) => fA2B(a)
}
export const A = apply

/**
 * haskell: fix, ramda: , sanctuary:
 */
export const fixPoint = (f) => ((g) => g(g))((g) => f((x) => g(g)(x)))
export const Y = fixPoint

/**
 * becard :: (c -> d) -> (b -> c) -> (a -> b) -> a -> d
 */
export function becard<C, D>(fnC2D: (a: C) => D) {
  return function becardFn<B>(fnB2C: (a: B) => C) {
    return function becardFn2<A>(fnAToB: (a: A) => B) {
      return function becardFn3(a: A) {
        return fnC2D(fnB2C(fnAToB(a)))
      }
    }
  }
}
export const B3 = becard

/**
 * bluebird' :: (a -> c -> d) -> a -> (b -> c) -> b -> d
 */
export function bluebirdPrime<A, C, D>(fnAC2D: (a: A) => (c: C) => D) {
  return (a: A) =>
    function getFnB2C<B>(fnB2C: (b: B) => C) {
      return (b: B) => fnAC2D(a)(fnB2C(b))
    }
}
export const BPrime = bluebirdPrime

/**
 * bunting :: (d -> e) -> (a -> b -> c -> d) -> a -> b -> c -> e
 */
export function bunting<D, E>(fnD2E: (a: D) => E) {
  return function buntingFn<A, B, C>(fnABC2D: (a: A) => (b: B) => (c: C) => D) {
    return (a: A) => (b: B) => (c: C) => fnD2E(fnABC2D(a)(b)(c))
  }
}
export const B2 = bunting

/**
 * cardinal' :: (c -> a -> d) -> (b -> c) -> a -> b -> d
 */
export function cardinalP<A, C, D>(fnCA2D: (c: C) => (a: A) => D) {
  return function cardinalPFn<B>(fnB2C: (b: B) => C) {
    return function fnAB2D(a: A) {
      return (b: B) => fnCA2D(fnB2C(b))(a)
    }
  }
}
export const CPrime = cardinalP

/**
 * cardinalstar :: (a -> c -> b -> d) -> a -> b -> c -> d
 */
export function cardinalStar<A, B, C, D>(fnACB2D: (a: A) => (c: C) => (b: B) => D) {
  return function fnABC2D(a: A) {
    return (b: B) => (c: C) => fnACB2D(a)(c)(b)
  }
}
export const CStar = cardinalStar

/**
 * cardinalstarstar :: (a -> b -> d -> c -> e) -> a -> b -> c -> d -> e
 */
export function cardinalStarStar<A, B, C, D, E>(
  fnABDC2E: (a: A) => (b: B) => (d: D) => (c: C) => E,
) {
  return function fnABCD2E(a: A) {
    return (b: B) => (c: C) => (d: D) => fnABDC2E(a)(b)(d)(c)
  }
}
export const CStarStar = cardinalStarStar

/**
 * dove :: (a -> c -> d) -> a -> (b -> c) -> b -> d
 */
export function dove<A, B, C, D>(fnAC2D: (a: A) => (c: C) => D) {
  return function getAFn(a: A) {
    return function getFnB2C(fnB2C: (b: B) => C) {
      return (b: B) => fnAC2D(a)(fnB2C(b))
    }
  }
}
export const D = dove

/**
 * dickcissel :: (a -> b -> d -> e) -> a -> b -> (c -> d) -> c -> e
 */
export function dickcissel<A, B, D, E>(fnABD2E: (a: A) => (b: B) => (d: D) => E) {
  return function getABFn(a: A) {
    return (b: B) =>
      function getFnC2D<C>(fnC2D: (c: C) => D) {
        return (c: C) => fnABD2E(a)(b)(fnC2D(c))
      }
  }
}
export const D1 = dickcissel

/**
 * dovekie :: (c -> d -> e) -> (a -> c) -> a -> (b -> d) -> b -> e
 */
export function dovekie<C, D, E>(fnCD2E: (c: C) => (d: D) => E) {
  return function getFnA2C<A>(fnA2C: (a: A) => C) {
    return (a: A) =>
      function getFnB2D<B>(fnB2D: (b: B) => D) {
        return (b: B) => fnCD2E(fnA2C(a))(fnB2D(b))
      }
  }
}
export const D2 = dovekie

/**
 * eagle :: (a -> d -> e) -> a -> (b -> c -> d) -> b -> c -> e
 */
export function eagle<A, D, E>(fnAD2E: (a: A) => (d: D) => E) {
  return (a: A) =>
    function getFnBC2D<B, C>(fnBC2D: (b: B) => (c: C) => D) {
      return (b: B) => (c: C) => fnAD2E(a)(fnBC2D(b)(c))
    }
}
export const E = eagle

/**
 * eaglebald :: (e -> f -> g) -> (a -> b -> e) -> a -> b -> (c -> d -> f) -> c -> d -> g
 */
export function eagleBald<E, F, G>(fnEF2G: (e: E) => (f: F) => G) {
  return function eagleBald1<A, B>(fnAB2E: (a: A) => (b: B) => E) {
    return (a: A) => (b: B) =>
      function eagleBald2<C, D>(fnCD2F: (c: C) => (d: D) => F) {
        return (c: C) => (d: D) => fnEF2G(fnAB2E(a)(b))(fnCD2F(c)(d))
      }
  }
}
export const EBald = eagleBald

/**
 * finch :: a -> b -> (b -> a -> c) -> c
 */
export function finch<A>(a: A) {
  return function getB<B>(b: B) {
    return function getFnBA2C<C>(fnBA2C: (b: B) => (a: A) => C) {
      return fnBA2C(b)(a)
    }
  }
}
export const F = finch

/**
 * finchstar :: (c -> b -> a -> d) -> a -> b -> c -> d
 */
export function finchStar<A, B, C, D>(fnCBA2D: (c: C) => (b: B) => (a: A) => D) {
  return (a: A) => (b: B) => (c: C) => fnCBA2D(c)(b)(a)
}
export const FStar = finchStar

/**
 * finchstarstar :: (a -> d -> c -> b -> e) -> a -> b -> c -> d -> e
 */
export function finchStarStar<A, B, C, D>(fnADCB2E: (a: A) => (d: D) => (c: C) => (b: B) => D) {
  return (a: A) => (b: B) => (c: C) => (d: D) => fnADCB2E(a)(d)(c)(b)
}
export const FStarStar = finchStarStar

/**
 * goldfinch :: (b -> c -> d) -> (a -> c) -> a -> b -> d
 */
export function goldFinch<B, C, D>(fnBC2D: (b: B) => (c: C) => D) {
  return <A, S extends (a: A) => C>(fnA2C: S) =>
    (a: A) =>
    (b: B) =>
      fnBC2D(b)(fnA2C(a))
}
export const G = goldFinch

/**
 * hummingbird :: (a -> b -> a -> c) -> a -> b -> c
 */
export function hummingbird<A, B, C>(fnABA2C: (a: A) => (b: B) => (a: A) => C) {
  return (a: A) => (b: B) => fnABA2C(a)(b)(a)
}
export const H = hummingbird

/**
 * idstar :: (a -> b) -> a -> b
 */
export function idStar<A, B>(fnA2B: (a: A) => B) {
  return (a: A) => fnA2B(a)
}
export const IStar = idStar

/**
 * idstarstar :: (a -> b -> c) -> a -> b -> c
 */
export function idStarStar<A, B, C>(fnAB2C: (a: A) => (b: B) => C) {
  return (a: A) => (b: B) => fnAB2C(a)(b)
}
export const IStarStar = idStarStar

/**
 * jalt :: (a -> c) -> a -> b -> c
 */
export function jalt<A, C>(fnA2C: (a: A) => C) {
  return (a: A) =>
    <B>(_b: B) =>
      fnA2C(a)
}
export const AltJ = jalt

/**
 * jalt' :: (a -> b -> d) -> a -> b -> c -> d
 */
export function jaltPrime<A, B, D>(fnAB2D: (a: A) => (b: B) => D) {
  return (a: A) => (b: B) => (_c: unknown) => fnAB2D(a)(b)
}
export const JPrime = jaltPrime

/**
 * jay :: (a -> b -> b) -> a -> b -> a -> b
 */
export function jay<A, B>(fnAB2B: (a: A) => (b: B) => B) {
  return (a1: A) => (b: B) => (a2: A) => fnAB2B(a1)(fnAB2B(a2)(b))
}
export const J = jay

/**
 * owl :: ((a -> b) -> a) -> (a -> b) -> b
 */
export function owl<A, B>(fnF: (fnG: (fn: A) => B) => A) {
  return function getFnG(fnG: (fn: A) => B) {
    return fnG(fnF(fnG))
  }
}
export const O = owl

/**
 * phoenix :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
 * (Big) Phi combinator - phoenix - Haskell liftM2. This is the same function as starling'.
 */
export function phoenix<B, C, D>(fnBC2A: (b: B) => (c: C) => D) {
  return function phoenix2<A>(fnA2B: (a: A) => B) {
    return function phoenix3(fnA2C: (a: A) => C) {
      return (a: A) => fnBC2A(fnA2B(a))(fnA2C(a))
    }
  }
}
export const BigPhi = phoenix

/**
 * quacky :: a -> (a -> b) -> (b -> c) -> c
 */
export function quacky<A>(a: A) {
  return function quacky1<B>(fnA2B: (a: A) => B) {
    return function quacky2<C>(fnB2C: (b: B) => C) {
      return fnB2C(fnA2B(a))
    }
  }
}
export const Q4 = quacky

/**
 * queer :: (a -> b) -> (b -> c) -> a -> c
 */
export function queer<A, B>(fnA2B: (a: A) => B) {
  return function queer1<C>(fnB2C: (a: B) => C) {
    return (a: A) => fnB2C(fnA2B(a))
  }
}
export const Q = queer

/**
 * quirky :: (a -> b) -> a -> (b -> c) -> c
 */
export function quirky<A, B>(fnA2B: (a: A) => B) {
  return (a: A) =>
    function queer1<C>(fnB2C: (a: B) => C) {
      return fnB2C(fnA2B(a))
    }
}
export const Q3 = quirky

/**
 * quixotic :: (b -> c) -> a -> (a -> b) -> c
 */
export function quixotic<B, C>(fnB2C: (b: B) => C) {
  return function getA<A>(a: A) {
    return function getAB(fnA2B: (a: A) => B) {
      return fnB2C(fnA2B(a))
    }
  }
}
export const Q1 = quixotic

/**
 * quizzical :: a -> (b -> c) -> (a -> b) -> c
 */
export function quizzical<A>(a: A) {
  return function getFnB2C<B, C>(fnB2C: (b: B) => C) {
    return function getFnA2B(fnA2B: (a: A) => B) {
      return fnB2C(fnA2B(a))
    }
  }
}
export const Q2 = quizzical

/**
 * robin :: a -> (b -> a -> c) -> b -> c
 */
export function robin<A>(a: A) {
  return function getFnBA2C<B, C>(fnBA2C: (b: B) => (a: A) => C) {
    return (b: B) => fnBA2C(b)(a)
  }
}
export const R = robin

/**
 * robinstar :: (b -> c -> a -> d) -> a -> b -> c -> d
 */
export function robinStar<B, C, A, D>(fnBCA2D: (b: B) => (c: C) => (a: A) => D) {
  return (a: A) => (b: B) => (c: C) => fnBCA2D(b)(c)(a)
}
export const RStar = robinStar

/**
 * robinstarstar :: (a -> c -> d -> b -> e) -> a -> b -> c -> d -> e
 */
export function robinStarStar<A, C, D, B, E>(fnACDB2E: (a: A) => (c: C) => (d: D) => (b: B) => E) {
  return (a: A) => (b: B) => (c: C) => (d: D) => fnACDB2E(a)(c)(d)(b)
}
export const RStarStar = robinStarStar

/**
 * starling' :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
 * same function as phoenix
 */
export const starlingPrime = phoenix
export const SPrime = phoenix

/**
 * vireostar :: (b -> a -> b -> d) -> a -> b -> b -> d
 */
export function vireoStar<B, A, D>(fnBAB2D: (b: B) => (a: A) => (b: B) => D) {
  return (a: A) => (b1: B) => (b2: B) => fnBAB2D(b1)(a)(b2)
}
export const VStar = vireoStar

/**
 * vireostarstar :: (a -> c -> b -> c -> e) -> a -> b -> c -> c -> e
 */
export function vireoStarStar<A, C, B, E>(fnACBC2E: (a: A) => (c: C) => (b: B) => (c: C) => E) {
  return (a: A) => (b: B) => (c1: C) => (c2: C) => fnACBC2E(a)(c2)(b)(c1)
}
export const VStarStar = vireoStarStar

/**
 * warbler :: (a -> a -> b) -> a -> b
 * haskell: join, ramda: unnest, sanctuary: join
 */
export function warbler<A, B>(fnAA2B: (a: A) => (a: A) => B) {
  return (a: A) => fnAA2B(a)(a)
}
export const W = warbler

/**
 * warbler1 :: a -> (a -> a -> b) -> b
 */
export function warbler1<A>(a: A) {
  return function getFnAA2B<B>(fnAA2B: (a: A) => (a: A) => B) {
    return fnAA2B(a)(a)
  }
}
export const W1 = warbler1

/**
 * warblerstar :: (a -> b -> b -> c) -> a -> b -> c
 */
export function warblerStar<A, B, C>(fnABB2C: (a: A) => (b: B) => (b: B) => C) {
  return (a: A) => (b: B) => fnABB2C(a)(b)(b)
}
export const WStar = warblerStar

/**
 * warblerstarstar :: (a -> b -> c -> c -> d) -> a -> b -> c -> d
 */
export function warblerStarStar<A, B, C, D>(fnABCC2D: (a: A) => (b: B) => (c: C) => (c: C) => D) {
  return (a: A) => (b: B) => (c: C) => fnABCC2D(a)(b)(c)(c)
}
export const WStarStar = warblerStarStar
