# combinators

## Table of contents
- [apply](#apply)
- [becard](#becard)
- [blackbird](#blackbird)
- [bluebird](#bluebird)
- [bluebirdPrime](#bluebirdprime)
- [bunting](#bunting)
- [cardinal](#cardinal)
- [cardinalP](#cardinalp)
- [cardinalStar](#cardinalstar)
- [cardinalStarStar](#cardinalstarstar)
- [dickcissel](#dickcissel)
- [dove](#dove)
- [dovekie](#dovekie)
- [eagle](#eagle)
- [eagleBald](#eaglebald)
- [finch](#finch)
- [finchStar](#finchstar)
- [finchStarStar](#finchstarstar)
- [fixPoint](#fixpoint)
- [goldFinch](#goldfinch)
- [hummingbird](#hummingbird)
- [idStar](#idstar)
- [idStarStar](#idstarstar)
- [identity](#identity)
- [idiot](#idiot)
- [jalt](#jalt)
- [jaltPrime](#jaltprime)
- [jay](#jay)
- [kestrel](#kestrel)
- [kite](#kite)
- [mockingbird](#mockingbird)
- [owl](#owl)
- [phoenix](#phoenix)
- [psi](#psi)
- [quacky](#quacky)
- [queer](#queer)
- [quirky](#quirky)
- [quixotic](#quixotic)
- [quizzical](#quizzical)
- [robin](#robin)
- [robinStar](#robinstar)
- [robinStarStar](#robinstarstar)
- [starling](#starling)
- [starlingPrime](#starlingprime)
- [thrush](#thrush)
- [vireo](#vireo)
- [vireoStar](#vireostar)
- [vireoStarStar](#vireostarstar)
- [warbler](#warbler)
- [warbler1](#warbler1)
- [warblerStar](#warblerstar)
- [warblerStarStar](#warblerstarstar)


### apply

`(a -> b) -> a -> b`

`<A, B>(fnA2B: (a: A) => B): (a: A) => B`

haskell: ($), ramda: call, sanctuary: A
applicator, i-star

Defined in:

[index.ts:233](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L233)

___

### becard

`(c -> d) -> (b -> c) -> (a -> b) -> a -> d`

`becard<C, D>(fnC2D: (a: C) => D): <B>(fnB2C: (a: B) => C) => <A>(fnAToB: (a: A) => B) => (a: A) => D`

Pass a value to a function and the result to another function and the result to another function

Defined in:

[index.ts:264](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L264)

___

### blackbird

`(c -> d) -> (a -> b -> c) -> a -> b -> d`

`<C, D>(fnC2D: (c: C) => D): <A, B>(fnAB2C: (a: A) => (b: B) => C) => (a: A) => (b: B) => D`

`λfgab.f(gab)`

Use: 1 <- 2 composition.

or `BBB`

Defined in:

[index.ts:183](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L183)

___

### bluebird

`(b -> c) -> (a -> b) -> a -> c`

`<B, C>(fnB2C: (b: B) => C): <A>(fnA2B: (a: A) => B) => (a: A) => C`

`λfga.f(ga)`

haskell: (.),fmap, ramda: map, sanctuary: compose, map

Use: 1 <- 1 composition.

Defined in:

[index.ts:107](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L107)

Defined in:

[index.ts:110](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L110)

___

### bluebirdPrime

`(a -> c -> d) -> a -> (b -> c) -> b -> d`

`<A, C, D>(fnAC2D: (a: A) => (c: C) => D): (a: A) => <B>(fnB2C: (b: B) => C) => (b: B) => D`

Defined in:

[index.ts:282](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L282)

___

### bunting

`(d -> e) -> (a -> b -> c -> d) -> a -> b -> c -> e`

`<D, E>(fnD2E: (a: D) => E): <A, B, C>(fnABC2D: (a: A) => (b: B) => (c: C) => D) => (a: A) => (b: B) => (c: C) => E`

Defined in:

[index.ts:297](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L297)

___

### cardinal

`(a -> b -> c) -> b -> a -> c`

`<A, B, C>(fnAB2C: (a: A) => (b: B) => C): (b: B) => (a: A) => C`

`λfab.fba`

haskell: flip, ramda: flip, sanctuary: flip

Use: reverses arguments.

Defined in:

[index.ts:70](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L70)

Defined in:

[index.ts:71](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L71)

___

### cardinalP

`(c -> a -> d) -> (b -> c) -> a -> b -> d`

`<A, C, D>(fnCA2D: (c: C) => (a: A) => D): <B>(fnB2C: (b: B) => C) => (a: A) => (b: B) => D`

Defined in:

[index.ts:311](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L311)

___

### cardinalStar

`(a -> c -> b -> d) -> a -> b -> c -> d`

`<A, B, C, D>(fnACB2D: (a: A) => (c: C) => (b: B) => D): (a: A) => (b: B) => (c: C) => D`

Defined in:

[index.ts:327](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L327)

___

### cardinalStarStar

`(a -> b -> d -> c -> e) -> a -> b -> c -> d -> e`

`<A, B, C, D, E>(fnABDC2E: (a: A) => (b: B) => (d: D) => (c: C) => E): (a: A) => (b: B) => (c: C) => (d: D) => E`

Defined in:

[index.ts:341](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L341)

___

### dickcissel

`(a -> b -> d -> e) -> a -> b -> (c -> d) -> c -> e`

`<A, B, D, E>(fnABD2E: (a: A) => (b: B) => (d: D) => E): (a: A) => (b: B) => <C>(fnC2D: (c: C) => D) => (c: C) => E`

Defined in:

[index.ts:373](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L373)

___

### dove

`(a -> c -> d) -> a -> (b -> c) -> b -> d`

`<A, B, C, D>(fnAC2D: (a: A) => (c: C) => D): (a: A) => (fnB2C: (b: B) => C) => (b: B) => D`

Defined in:

[index.ts:357](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L357)

___

### dovekie

`(c -> d -> e) -> (a -> c) -> a -> (b -> d) -> b -> e`

`<C, D, E>(fnCD2E: (c: C) => (d: D) => E): <A>(fnA2C: (a: A) => C) => (a: A) => <B>(fnB2D: (b: B) => D) => (b: B) => E`

Defined in:

[index.ts:390](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L390)

___

### eagle

`(a -> d -> e) -> a -> (b -> c -> d) -> b -> c -> e`

`<A, D, E>(fnAD2E: (a: A) => (d: D) => E): (a: A) => <B, C>(fnBC2D: (b: B) => (c: C) => D) => (b: B) => (c: C) => E`

Defined in:

[index.ts:407](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L407)

___

### eagleBald

`(e -> f -> g) -> (a -> b -> e) -> a -> b -> (c -> d -> f) -> c -> d -> g`

`<E, F, G>(fnEF2G: (e: E) => (f: F) => G): <A, B>(fnAB2E: (a: A) => (b: B) => E) => (a: A) => (b: B) => <C, D>(fnCD2F: (c: C) => (d: D) => F) => (c: C) => (d: D) => G`

Defined in:

[index.ts:422](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L422)

___

### finch

`a -> b -> (b -> a -> c) -> c`

`<A>(a: A): <B>(b: B) => <C>(fnBA2C: (b: B) => (a: A) => C) => C`

Defined in:

[index.ts:439](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L439)

___

### finchStar

`(c -> b -> a -> d) -> a -> b -> c -> d`

`<A, B, C, D>(fnCBA2D: (c: C) => (b: B) => (a: A) => D): (a: A) => (b: B) => (c: C) => D`

Defined in:

[index.ts:455](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L455)

___

### finchStarStar

`(a -> d -> c -> b -> e) -> a -> b -> c -> d -> e`

`<A, B, C, D>(fnADCB2E: (a: A) => (d: D) => (c: C) => (b: B) => D): (a: A) => (b: B) => (c: C) => (d: D) => D`

Defined in:

[index.ts:467](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L467)

___

### fixPoint

`<I, O>(fn: (fn: (i: I) => O) => (i: I) => O) => (i: I) => O`

`λf.(λy.f(y y))(λy.f(y y))`

haskell: fix, ramda: , sanctuary:

Defined in:

[index.ts:247](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L247)

___

### goldFinch

`(b -> c -> d) -> (a -> c) -> a -> b -> d`

`<B, C, D>(fnBC2D: (b: B) => (c: C) => D): <A, S extends (a: A) => C>(fnA2C: S) => (a: A) => (b: B) => D`

Defined in:

[index.ts:479](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L479)

___

### hummingbird

`(a -> b -> a -> c) -> a -> b -> c`

`<A, B, C>(fnABA2C: (a: A) => (b: B) => (a: A) => C): (a: A) => (b: B) => C`

Defined in:

[index.ts:494](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L494)

___

### idStar

`(a -> b) -> a -> b`

`<I, O>(fnA2B: (input: I) => O): (input: I) => O`

idiot once removed

Defined in:

[index.ts:508](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L508)

___

### idStarStar

`(a -> b -> c) -> a -> b -> c`

`<A, B, C>(fnAB2C: (a: A) => (b: B) => C): (a: A) => (b: B) => C`

idiot twice removed

2 params to a function of arity 2

Defined in:

[index.ts:524](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L524)

___

### identity

`a -> a`

`<A>(a: A): A`

`λa.a`

haskell: id, ramda: identity, sanctuary: I

Defined in:

[index.ts:13](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L13)

___

### idiot

`a -> a`

`<A>(a: A): A`

`λa.a`

haskell: id, ramda: identity, sanctuary: I

Defined in:

[index.ts:13](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L13)

___

### jalt

`(a -> c) -> a -> b -> c`

`<A, C>(fnA2C: (a: A) => C): (a: A) => <B>(_b: B) => C`

Defined in:

[index.ts:536](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L536)

___

### jaltPrime

`(a -> b -> d) -> a -> b -> c -> d`

`<A, B, D>(fnAB2D: (a: A) => (b: B) => D): (a: A) => (b: B) => (_c: any) => D`

Defined in:

[index.ts:550](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L550)

___

### jay

`(a -> b -> b) -> a -> b -> a -> b`

`<A, B>(fnAB2B: (a: A) => (b: B) => B): (a1: A) => (b: B) => (a2: A) => B`

Defined in:

[index.ts:562](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L562)

___

### kestrel

`a -> b -> a`

`<A>(a: A): <B>(_b: B) => A`

`λab.a`

haskell: const, ramda: always, sanctuary: K

Encoding of true in lambda calculus

Defined in:

[index.ts:32](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L32)

___

### kite

`a -> b -> b`

`<A>(_a: A): <B>(b: B) => B`

`λab.b`

KI or CK

Encoding of false in lambda calculus

Defined in:

[index.ts:51](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L51)

___

### mockingbird

`<T>(fn: (fn: any) => T): T`

`λf.ff`

Mockingbird combinator. Use: self-application.

Defined in:

[index.ts:86](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L86)

___

### owl

`((a -> b) -> a) -> (a -> b) -> b`

`<A, B>(fnF: (fnG: (fn: A) => B) => A): (fnG: (fn: A) => B) => B`

Defined in:

[index.ts:574](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L574)

___

### phoenix

 `D`

`(b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d`

`<B, C, D>(fnBC2A: (b: B) => (c: C) => D): <A>(fnA2B: (a: A) => B) => (fnA2C: (a: A) => C) => (a: A) => D`

(Big) Phi combinator - phoenix - Haskell liftM2. This is the same function as starling'.

Defined in:

[index.ts:590](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L590)

___

### psi

`(b -> b -> c) -> (a -> b) -> a -> a -> c`

`<B, C>(fnBB2C: (b: B) => (b: B) => C): <A>(fnA2B: (a: A) => B) => (a1: A) => (a2: A) => C`

haskell: on, ramda: , sanctuary: on

Defined in:

[index.ts:216](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L216)

___

### quacky

`a -> (a -> b) -> (b -> c) -> c`

`<A>(a: A): <B>(fnA2B: (a: A) => B) => <C>(fnB2C: (b: B) => C) => C`

Defined in:

[index.ts:606](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L606)

___

### queer

`(a -> b) -> (b -> c) -> a -> c`

`<A, B>(fnA2B: (a: A) => B): <C>(fnB2C: (a: B) => C) => (a: A) => C`

Defined in:

[index.ts:622](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L622)

___

### quirky

`(a -> b) -> a -> (b -> c) -> c`

`<A, B>(fnA2B: (a: A) => B): (a: A) => <C>(fnB2C: (a: B) => C) => C`

Defined in:

[index.ts:636](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L636)

___

### quixotic

`(b -> c) -> a -> (a -> b) -> c`

`<B, C>(fnB2C: (b: B) => C): <A>(a: A) => (fnA2B: (a: A) => B) => C (b -> c) -> a -> (a -> b) -> c`

Defined in:

[index.ts:651](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L651)

___

### quizzical

`a -> (b -> c) -> (a -> b) -> c`

`<A>(a: A): <B, C>(fnB2C: (b: B) => C) => (fnA2B: (a: A) => B) => C`

Defined in:

[index.ts:667](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L667)

___

### robin

`a -> (b -> a -> c) -> b -> c`

`<A>(a: A): <B, C>(fnBA2C: (b: B) => (a: A) => C) => (b: B) => C`

Defined in:

[index.ts:683](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L683)

___

### robinStar

`(b -> c -> a -> d) -> a -> b -> c -> d`

`<B, C, A, D>(fnBCA2D: (b: B) => (c: C) => (a: A) => D): (a: A) => (b: B) => (c: C) => D`

Defined in:

[index.ts:697](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L697)

___

### robinStarStar

`(a -> c -> d -> b -> e) -> a -> b -> c -> d -> e`

`<A, C, D, B, E>(fnACDB2E: (a: A) => (c: C) => (d: D) => (b: B) => E): (a: A) => (b: B) => (c: C) => (d: D) => E`

Defined in:

[index.ts:709](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L709)

___

### starling

`(a -> b -> c) -> (a -> b) -> a -> c`

`<A, B, C>(fnAB2C: (a: A) => (b: B) => C): (fnA2B: (a: A) => B) => (a: A) => C`

haskell: ap - Applicative's (<*>) on functions., ramda: ap, sanctuary: ap

Defined in:

[index.ts:200](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L200)

___

### starlingPrime

`(b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d`

`<B, C, D>(fnBC2A: (b: B) => (c: C) => D) => <A>(fnA2B: (a: A) => B) => (fnA2C: (a: A) => C) => (a: A) => D`

same function as phoenix

Defined in:

[index.ts:590](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L590)

___

### thrush

`a -> (a -> b) -> b`

`<A>(a: A): <B>(fnA2B: (a: A) => B) => B`

`λaf.fa`

haskell: (&), ramda: applyTo, sanctuary: T

Haskell (#) in Peter Thiemann's Wash, reverse application.

Use: hold an argument.

or CI

Defined in:

[index.ts:135](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L135)

___

### vireo

`a -> b -> (a -> b -> c) -> c`

`<A>(a: A): <B>(b: B) => <C>(fnAB2C: (a: A) => (b: B) => C) => C`

`λabf.fab`

Use: hold a pair of arguments.

BCT

Defined in:

[index.ts:155](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L155)

___

### vireoStar

`(b -> a -> b -> d) -> a -> b -> b -> d`

`<B, A, D>(fnBAB2D: (b: B) => (a: A) => (b: B) => D): (a: A) => (b1: B) => (b2: B) => D`

Defined in:

[index.ts:733](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L733)

___

### vireoStarStar

`(a -> c -> b -> c -> e) -> a -> b -> c -> c -> e`

`<A, C, B, E>(fnACBC2E: (a: A) => (c: C) => (b: B) => (c: C) => E): (a: A) => (b: B) => (c1: C) => (c2: C) => E`

Defined in:

[index.ts:745](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L745)

___

### warbler

`(a -> a -> b) -> a -> b`

`<A, B>(fnAA2B: (a: A) => (a: A) => B): (a: A) => B`

haskell: join, ramda: unnest, sanctuary: join

Defined in:

[index.ts:759](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L759)

___

### warbler1

`a -> (a -> a -> b) -> b`

`<A>(a: A): <B>(fnAA2B: (a: A) => (a: A) => B) => B`

Defined in:

[index.ts:771](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L771)

___

### warblerStar

`(a -> b -> b -> c) -> a -> b -> c`

`<A, B, C>(fnABB2C: (a: A) => (b: B) => (b: B) => C): (a: A) => (b: B) => C`

Defined in:

[index.ts:785](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L785)

___

### warblerStarStar

`(a -> b -> c -> c -> d) -> a -> b -> c -> d`

`<A, B, C, D>(fnABCC2D: (a: A) => (b: B) => (c: C) => (c: C) => D): (a: A) => (b: B) => (c: C) => D`

Defined in:

[index.ts:797](https://github.com/TrevTheDev/monorepo/blob/1784268/packages/combinators/src/index.ts#L797)
