[@trevthedev/combinators](README.md) / Exports

# @trevthedev/combinators

## Table of contents

### Functions

- [A](modules.md#a)
- [AltJ](modules.md#altj)
- [B](modules.md#b)
- [B1](modules.md#b1)
- [B2](modules.md#b2)
- [B3](modules.md#b3)
- [BPrime](modules.md#bprime)
- [BigPhi](modules.md#bigphi)
- [C](modules.md#c)
- [CPrime](modules.md#cprime)
- [CStar](modules.md#cstar)
- [CStarStar](modules.md#cstarstar)
- [D](modules.md#d)
- [D1](modules.md#d1)
- [D2](modules.md#d2)
- [E](modules.md#e)
- [EBald](modules.md#ebald)
- [F](modules.md#f)
- [FStar](modules.md#fstar)
- [FStarStar](modules.md#fstarstar)
- [G](modules.md#g)
- [H](modules.md#h)
- [I](modules.md#i)
- [IStar](modules.md#istar)
- [IStarStar](modules.md#istarstar)
- [J](modules.md#j)
- [JPrime](modules.md#jprime)
- [K](modules.md#k)
- [KI](modules.md#ki)
- [M](modules.md#m)
- [O](modules.md#o)
- [P](modules.md#p)
- [Q](modules.md#q)
- [Q1](modules.md#q1)
- [Q2](modules.md#q2)
- [Q3](modules.md#q3)
- [Q4](modules.md#q4)
- [R](modules.md#r)
- [RStar](modules.md#rstar)
- [RStarStar](modules.md#rstarstar)
- [S](modules.md#s)
- [SPrime](modules.md#sprime)
- [T](modules.md#t)
- [V](modules.md#v)
- [VStar](modules.md#vstar)
- [VStarStar](modules.md#vstarstar)
- [W](modules.md#w)
- [W1](modules.md#w1)
- [WStar](modules.md#wstar)
- [WStarStar](modules.md#wstarstar)
- [Y](modules.md#y)
- [apply](modules.md#apply)
- [becard](modules.md#becard)
- [blackbird](modules.md#blackbird)
- [bluebird](modules.md#bluebird)
- [bluebirdPrime](modules.md#bluebirdprime)
- [bunting](modules.md#bunting)
- [cardinal](modules.md#cardinal)
- [cardinalP](modules.md#cardinalp)
- [cardinalStar](modules.md#cardinalstar)
- [cardinalStarStar](modules.md#cardinalstarstar)
- [dickcissel](modules.md#dickcissel)
- [dove](modules.md#dove)
- [dovekie](modules.md#dovekie)
- [eagle](modules.md#eagle)
- [eagleBald](modules.md#eaglebald)
- [finch](modules.md#finch)
- [finchStar](modules.md#finchstar)
- [finchStarStar](modules.md#finchstarstar)
- [fixPoint](modules.md#fixpoint)
- [goldFinch](modules.md#goldfinch)
- [hummingbird](modules.md#hummingbird)
- [idStar](modules.md#idstar)
- [idStarStar](modules.md#idstarstar)
- [identity](modules.md#identity)
- [jalt](modules.md#jalt)
- [jaltPrime](modules.md#jaltprime)
- [jay](modules.md#jay)
- [kestrel](modules.md#kestrel)
- [kite](modules.md#kite)
- [mockingbird](modules.md#mockingbird)
- [owl](modules.md#owl)
- [phoenix](modules.md#phoenix)
- [psi](modules.md#psi)
- [quacky](modules.md#quacky)
- [queer](modules.md#queer)
- [quirky](modules.md#quirky)
- [quixotic](modules.md#quixotic)
- [quizzical](modules.md#quizzical)
- [robin](modules.md#robin)
- [robinStar](modules.md#robinstar)
- [robinStarStar](modules.md#robinstarstar)
- [starling](modules.md#starling)
- [starlingPrime](modules.md#starlingprime)
- [thrush](modules.md#thrush)
- [vireo](modules.md#vireo)
- [vireoStar](modules.md#vireostar)
- [vireoStarStar](modules.md#vireostarstar)
- [warbler](modules.md#warbler)
- [warbler1](modules.md#warbler1)
- [warblerStar](modules.md#warblerstar)
- [warblerStarStar](modules.md#warblerstarstar)

## Functions

### A

▸ **A**\<`A`, `B`\>(`fA2B`): (`a`: `A`) => `B`

applicator :: (a -> b) -> a -> b
haskell: ($), ramda: call, sanctuary: A
applicator, i-star

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`B`

#### Defined in

index.ts:170

___

### AltJ

▸ **AltJ**\<`A`, `C`\>(`fnA2C`): (`a`: `A`) => \<B\>(`_b`: `B`) => `C`

jalt :: (a -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

#### Returns

`fn`

▸ (`a`): \<B\>(`_b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`\>(`_b`): `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `_b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:378

___

### B

▸ **B**\<`T`\>(`fnB2C`): \<S\>(`fnA2B`: `S`) => (`a`: `Parameters`\<`S`\>[``0``]) => `ReturnType`\<`T`\>

bluebird :: (b -> c) -> (a -> b) -> a -> c
haskell: (.),fmap, ramda: map, sanctuary: compose, map

Use: 1 <- 1 composition.

λfga.f(ga)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (`b`: `any`) => `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | `T` |

#### Returns

`fn`

▸ \<`S`\>(`fnA2B`): (`a`: `Parameters`\<`S`\>[``0``]) => `ReturnType`\<`T`\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends (`a`: `any`) => `Parameters`\<`T`\>[``0``] |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | `S` |

##### Returns

`fn`

▸ (`a`): `ReturnType`\<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `Parameters`\<`S`\>[``0``] |

##### Returns

`ReturnType`\<`T`\>

#### Defined in

index.ts:69

▸ **B**\<`B`, `C`\>(`fnB2C`): \<A\>(`fnA2B`: (`a`: `A`) => `B`) => (`a`: `A`) => `C`

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2B`): (`a`: `A`) => `C`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:72

___

### B1

▸ **B1**\<`C`, `D`\>(`fnC2D`): \<A, B\>(`fnAB2C`: (`a`: `A`) => (`b`: `B`) => `C`) => (`a`: `A`) => (`b`: `B`) => `D`

blackbird :: (c -> d) -> (a -> b -> c) -> a -> b -> d

Use: 1 <- 2 composition.

λfgab.f(gab) or BBB

#### Type parameters

| Name |
| :------ |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnC2D` | (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`, `B`\>(`fnAB2C`): (`a`: `A`) => (`b`: `B`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:135

___

### B2

▸ **B2**\<`D`, `E`\>(`fnD2E`): \<A, B, C\>(`fnABC2D`: (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`) => (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `E`

bunting :: (d -> e) -> (a -> b -> c -> d) -> a -> b -> c -> e

#### Type parameters

| Name |
| :------ |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnD2E` | (`a`: `D`) => `E` |

#### Returns

`fn`

▸ \<`A`, `B`, `C`\>(`fnABC2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `E`

##### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnABC2D` | (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`E`

#### Defined in

index.ts:209

___

### B3

▸ **B3**\<`C`, `D`\>(`fnC2D`): \<B\>(`fnB2C`: (`a`: `B`) => `C`) => \<A\>(`fnAToB`: (`a`: `A`) => `B`) => (`a`: `A`) => `D`

becard :: (c -> d) -> (b -> c) -> (a -> b) -> a -> d

#### Type parameters

| Name |
| :------ |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnC2D` | (`a`: `C`) => `D` |

#### Returns

`fn`

▸ \<`B`\>(`fnB2C`): \<A\>(`fnAToB`: (`a`: `A`) => `B`) => (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`a`: `B`) => `C` |

##### Returns

`fn`

▸ \<`A`\>(`fnAToB`): (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAToB` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`D`

#### Defined in

index.ts:184

___

### BPrime

▸ **BPrime**\<`A`, `C`, `D`\>(`fnAC2D`): (`a`: `A`) => \<B\>(`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

bluebird' :: (a -> c -> d) -> a -> (b -> c) -> b -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAC2D` | (`a`: `A`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ (`a`): \<B\>(`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`\>(`fnB2C`): (`b`: `B`) => `D`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:198

___

### BigPhi

▸ **BigPhi**\<`B`, `C`, `D`\>(`fnBC2A`): \<A\>(`fnA2B`: (`a`: `A`) => `B`) => (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

phoenix :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
(Big) Phi combinator - phoenix - Haskell liftM2. This is the same function as starling'.

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2A` | (`b`: `B`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2B`): (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`fnA2C`): (`a`: `A`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`a`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`D`

#### Defined in

index.ts:415

___

### C

▸ **C**\<`A`, `B`, `C`, `T`\>(`fnAB2C`): (`b`: `B`) => (`a`: `A`) => `C`

cardinal :: (a -> b -> c) -> b -> a -> c

haskell: flip, ramda: flip, sanctuary: flip

Use: reverse arguments.
λfab.fba

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `B` | `B` |
| `C` | `C` |
| `T` | extends (`a`: `A`) => (`b`: `B`) => `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | `T` |

#### Returns

`fn`

▸ (`b`): (`a`: `A`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:42

___

### CPrime

▸ **CPrime**\<`A`, `C`, `D`\>(`fnCA2D`): \<B\>(`fnB2C`: (`b`: `B`) => `C`) => (`a`: `A`) => (`b`: `B`) => `D`

cardinal' :: (c -> a -> d) -> (b -> c) -> a -> b -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnCA2D` | (`c`: `C`) => (`a`: `A`) => `D` |

#### Returns

`fn`

▸ \<`B`\>(`fnB2C`): (`a`: `A`) => (`b`: `B`) => `D`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:219

___

### CStar

▸ **CStar**\<`A`, `B`, `C`, `D`\>(`fnACB2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

cardinalstar :: (a -> c -> b -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnACB2D` | (`a`: `A`) => (`c`: `C`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:231

___

### CStarStar

▸ **CStarStar**\<`A`, `B`, `C`, `D`, `E`\>(`fnABDC2E`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

cardinalstarstar :: (a -> b -> d -> c -> e) -> a -> b -> c -> d -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABDC2E` | (`a`: `A`) => (`b`: `B`) => (`d`: `D`) => (`c`: `C`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`E`

#### Defined in

index.ts:241

___

### D

▸ **D**\<`A`, `B`, `C`, `D`\>(`fnAC2D`): (`a`: `A`) => (`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

dove :: (a -> c -> d) -> a -> (b -> c) -> b -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAC2D` | (`a`: `A`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ (`a`): (`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`fnB2C`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:253

___

### D1

▸ **D1**\<`A`, `B`, `D`, `E`\>(`fnABD2E`): (`a`: `A`) => (`b`: `B`) => \<C\>(`fnC2D`: (`c`: `C`) => `D`) => (`c`: `C`) => `E`

dickcissel :: (a -> b -> d -> e) -> a -> b -> (c -> d) -> c -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABD2E` | (`a`: `A`) => (`b`: `B`) => (`d`: `D`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => \<C\>(`fnC2D`: (`c`: `C`) => `D`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): \<C\>(`fnC2D`: (`c`: `C`) => `D`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnC2D`): (`c`: `C`) => `E`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnC2D` | (`c`: `C`) => `D` |

##### Returns

`fn`

▸ (`c`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`E`

#### Defined in

index.ts:265

___

### D2

▸ **D2**\<`C`, `D`, `E`\>(`fnCD2E`): \<A\>(`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => \<B\>(`fnB2D`: (`b`: `B`) => `D`) => (`b`: `B`) => `E`

dovekie :: (c -> d -> e) -> (a -> c) -> a -> (b -> d) -> b -> e

#### Type parameters

| Name |
| :------ |
| `C` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnCD2E` | (`c`: `C`) => (`d`: `D`) => `E` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2C`): (`a`: `A`) => \<B\>(`fnB2D`: (`b`: `B`) => `D`) => (`b`: `B`) => `E`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`a`): \<B\>(`fnB2D`: (`b`: `B`) => `D`) => (`b`: `B`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`\>(`fnB2D`): (`b`: `B`) => `E`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2D` | (`b`: `B`) => `D` |

##### Returns

`fn`

▸ (`b`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`E`

#### Defined in

index.ts:278

___

### E

▸ **E**\<`A`, `D`, `E`\>(`fnAD2E`): (`a`: `A`) => \<B, C\>(`fnBC2D`: (`b`: `B`) => (`c`: `C`) => `D`) => (`b`: `B`) => (`c`: `C`) => `E`

eagle :: (a -> d -> e) -> a -> (b -> c -> d) -> b -> c -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAD2E` | (`a`: `A`) => (`d`: `D`) => `E` |

#### Returns

`fn`

▸ (`a`): \<B, C\>(`fnBC2D`: (`b`: `B`) => (`c`: `C`) => `D`) => (`b`: `B`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`, `C`\>(`fnBC2D`): (`b`: `B`) => (`c`: `C`) => `E`

##### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2D` | (`b`: `B`) => (`c`: `C`) => `D` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`E`

#### Defined in

index.ts:291

___

### EBald

▸ **EBald**\<`E`, `F`, `G`\>(`fnEF2G`): \<A, B\>(`fnAB2E`: (`a`: `A`) => (`b`: `B`) => `E`) => (`a`: `A`) => (`b`: `B`) => \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

eaglebald :: (e -> f -> g) -> (a -> b -> e) -> a -> b -> (c -> d -> f) -> c -> d -> g

#### Type parameters

| Name |
| :------ |
| `E` |
| `F` |
| `G` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnEF2G` | (`e`: `E`) => (`f`: `F`) => `G` |

#### Returns

`fn`

▸ \<`A`, `B`\>(`fnAB2E`): (`a`: `A`) => (`b`: `B`) => \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

##### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2E` | (`a`: `A`) => (`b`: `B`) => `E` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`, `D`\>(`fnCD2F`): (`c`: `C`) => (`d`: `D`) => `G`

##### Type parameters

| Name |
| :------ |
| `C` |
| `D` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnCD2F` | (`c`: `C`) => (`d`: `D`) => `F` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`G`

#### Defined in

index.ts:302

___

### F

▸ **F**\<`A`\>(`a`): \<B\>(`b`: `B`) => \<C\>(`fnBA2C`: (`b`: `B`) => (`a`: `A`) => `C`) => `C`

finch :: a -> b -> (b -> a -> c) -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`b`): \<C\>(`fnBA2C`: (`b`: `B`) => (`a`: `A`) => `C`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnBA2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnBA2C` | (`b`: `B`) => (`a`: `A`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:315

___

### FStar

▸ **FStar**\<`A`, `B`, `C`, `D`\>(`fnCBA2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

finchstar :: (c -> b -> a -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnCBA2D` | (`c`: `C`) => (`b`: `B`) => (`a`: `A`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:327

___

### FStarStar

▸ **FStarStar**\<`A`, `B`, `C`, `D`\>(`fnADCB2E`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `D`

finchstarstar :: (a -> d -> c -> b -> e) -> a -> b -> c -> d -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnADCB2E` | (`a`: `A`) => (`d`: `D`) => (`c`: `C`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => (`d`: `D`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`D`

#### Defined in

index.ts:335

___

### G

▸ **G**\<`B`, `C`, `D`\>(`fnBC2D`): \<A, S\>(`fnA2C`: `S`) => (`a`: `A`) => (`b`: `B`) => `D`

goldfinch :: (b -> c -> d) -> (a -> c) -> a -> b -> d

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2D` | (`b`: `B`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`, `S`\>(`fnA2C`): (`a`: `A`) => (`b`: `B`) => `D`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `S` | extends (`a`: `A`) => `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | `S` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:343

___

### H

▸ **H**\<`A`, `B`, `C`\>(`fnABA2C`): (`a`: `A`) => (`b`: `B`) => `C`

hummingbird :: (a -> b -> a -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABA2C` | (`a`: `A`) => (`b`: `B`) => (`a`: `A`) => `C` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:354

___

### I

▸ **I**\<`A`\>(`a`): `A`

haskell: id, ramda: identity, sanctuary: I

λa.a

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`A`

#### Defined in

index.ts:7

___

### IStar

▸ **IStar**\<`A`, `B`\>(`fnA2B`): (`a`: `A`) => `B`

idstar :: (a -> b) -> a -> b

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`B`

#### Defined in

index.ts:362

___

### IStarStar

▸ **IStarStar**\<`A`, `B`, `C`\>(`fnAB2C`): (`a`: `A`) => (`b`: `B`) => `C`

idstarstar :: (a -> b -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:370

___

### J

▸ **J**\<`A`, `B`\>(`fnAB2B`): (`a1`: `A`) => (`b`: `B`) => (`a2`: `A`) => `B`

jay :: (a -> b -> b) -> a -> b -> a -> b

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2B` | (`a`: `A`) => (`b`: `B`) => `B` |

#### Returns

`fn`

▸ (`a1`): (`b`: `B`) => (`a2`: `A`) => `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a1` | `A` |

##### Returns

`fn`

▸ (`b`): (`a2`: `A`) => `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`a2`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a2` | `A` |

##### Returns

`B`

#### Defined in

index.ts:396

___

### JPrime

▸ **JPrime**\<`A`, `B`, `D`\>(`fnAB2D`): (`a`: `A`) => (`b`: `B`) => (`_c`: `unknown`) => `D`

jalt' :: (a -> b -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2D` | (`a`: `A`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`_c`: `unknown`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`_c`: `unknown`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`_c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `_c` | `unknown` |

##### Returns

`D`

#### Defined in

index.ts:388

___

### K

▸ **K**\<`A`\>(`a`): \<B\>(`_b`: `B`) => `A`

kestrel :: a -> b -> a
haskell: const, ramda: always, sanctuary: K

λab.a

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`_b`): `A`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `_b` | `B` |

##### Returns

`A`

#### Defined in

index.ts:18

___

### KI

▸ **KI**\<`A`\>(`_a`): \<B\>(`b`: `B`) => `B`

kite :: a -> b -> b

λab.b or KI or CK

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`b`): `B`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`B`

#### Defined in

index.ts:28

___

### M

▸ **M**\<`T`\>(`fn`): `T`

Mockingbird combinator. Use: self-application.

λf.ff

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`a`: `any`) => `T` |

#### Returns

`T`

#### Defined in

index.ts:53

___

### O

▸ **O**\<`A`, `B`\>(`fnF`): (`fnG`: (`fn`: `A`) => `B`) => `B`

owl :: ((a -> b) -> a) -> (a -> b) -> b

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnF` | (`fnG`: (`fn`: `A`) => `B`) => `A` |

#### Returns

`fn`

▸ (`fnG`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnG` | (`fn`: `A`) => `B` |

##### Returns

`B`

#### Defined in

index.ts:404

___

### P

▸ **P**\<`B`, `C`\>(`fBB2C`): \<A\>(`fA2B`: (`a`: `A`) => `B`) => (`a1`: `A`) => (`a2`: `A`) => `C`

psi :: (b -> b -> c) -> (a -> b) -> a -> a -> c
haskell: on, ramda: , sanctuary: on

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fBB2C` | (`b`: `B`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ \<`A`\>(`fA2B`): (`a1`: `A`) => (`a2`: `A`) => `C`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a1`): (`a2`: `A`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a1` | `A` |

##### Returns

`fn`

▸ (`a2`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a2` | `A` |

##### Returns

`C`

#### Defined in

index.ts:158

___

### Q

▸ **Q**\<`A`, `B`\>(`fnA2B`): \<C\>(`fnB2C`: (`a`: `B`) => `C`) => (`a`: `A`) => `C`

queer :: (a -> b) -> (b -> c) -> a -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ \<`C`\>(`fnB2C`): (`a`: `A`) => `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`a`: `B`) => `C` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:439

___

### Q1

▸ **Q1**\<`B`, `C`\>(`fnB2C`): \<A\>(`a`: `A`) => (`fnA2B`: (`a`: `A`) => `B`) => `C`

quixotic :: (b -> c) -> a -> (a -> b) -> c

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

#### Returns

`fn`

▸ \<`A`\>(`a`): (`fnA2B`: (`a`: `A`) => `B`) => `C`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`fnA2B`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`C`

#### Defined in

index.ts:460

___

### Q2

▸ **Q2**\<`A`\>(`a`): \<B, C\>(`fnB2C`: (`b`: `B`) => `C`) => (`fnA2B`: (`a`: `A`) => `B`) => `C`

quizzical :: a -> (b -> c) -> (a -> b) -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`, `C`\>(`fnB2C`): (`fnA2B`: (`a`: `A`) => `B`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`fnA2B`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`C`

#### Defined in

index.ts:472

___

### Q3

▸ **Q3**\<`A`, `B`\>(`fnA2B`): (`a`: `A`) => \<C\>(`fnB2C`: (`a`: `B`) => `C`) => `C`

quirky :: (a -> b) -> a -> (b -> c) -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): \<C\>(`fnB2C`: (`a`: `B`) => `C`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`C`\>(`fnB2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`a`: `B`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:449

___

### Q4

▸ **Q4**\<`A`\>(`a`): \<B\>(`fnA2B`: (`a`: `A`) => `B`) => \<C\>(`fnB2C`: (`b`: `B`) => `C`) => `C`

quacky :: a -> (a -> b) -> (b -> c) -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`fnA2B`): \<C\>(`fnB2C`: (`b`: `B`) => `C`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnB2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:427

___

### R

▸ **R**\<`A`\>(`a`): \<B, C\>(`fnBA2C`: (`b`: `B`) => (`a`: `A`) => `C`) => (`b`: `B`) => `C`

robin :: a -> (b -> a -> c) -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`, `C`\>(`fnBA2C`): (`b`: `B`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnBA2C` | (`b`: `B`) => (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:484

___

### RStar

▸ **RStar**\<`B`, `C`, `A`, `D`\>(`fnBCA2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

robinstar :: (b -> c -> a -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `A` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBCA2D` | (`b`: `B`) => (`c`: `C`) => (`a`: `A`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:494

___

### RStarStar

▸ **RStarStar**\<`A`, `C`, `D`, `B`, `E`\>(`fnACDB2E`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

robinstarstar :: (a -> c -> d -> b -> e) -> a -> b -> c -> d -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `D` |
| `B` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnACDB2E` | (`a`: `A`) => (`c`: `C`) => (`d`: `D`) => (`b`: `B`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`E`

#### Defined in

index.ts:502

___

### S

▸ **S**\<`A`, `B`, `C`\>(`fnAB2C`): (`fnA2B`: (`a`: `A`) => `B`) => (`a`: `A`) => `C`

haskell: ap - Applicative's (<*>) on functions., ramda: ap, sanctuary: ap

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ (`fnA2B`): (`a`: `A`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:147

___

### SPrime

▸ **SPrime**\<`B`, `C`, `D`\>(`fnBC2A`): \<A\>(`fnA2B`: (`a`: `A`) => `B`) => (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

phoenix :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
(Big) Phi combinator - phoenix - Haskell liftM2. This is the same function as starling'.

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2A` | (`b`: `B`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2B`): (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`fnA2C`): (`a`: `A`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`a`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`D`

#### Defined in

index.ts:415

___

### T

▸ **T**\<`A`\>(`a`): \<B\>(`fnA2B`: (`a`: `A`) => `B`) => `B`

thrush :: a -> (a -> b) -> b

haskell: (&), ramda: applyTo, sanctuary: T

Haskell (#) in Peter Thiemann's Wash, reverse application.

Use: hold an argument.

λaf.fa or CI

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`fnA2B`): `B`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`B`

#### Defined in

index.ts:91

___

### V

▸ **V**\<`A`\>(`a`): \<B\>(`b`: `B`) => \<C\>(`fnAB2C`: (`a`: `A`) => (`b`: `B`) => `C`) => `C`

vireo :: a -> b -> (a -> b -> c) -> c

Use: hold a pair of arguments.

λabf.fab or BCT

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`b`): \<C\>(`fnAB2C`: (`a`: `A`) => (`b`: `B`) => `C`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnAB2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:105

___

### VStar

▸ **VStar**\<`B`, `A`, `D`\>(`fnBAB2D`): (`a`: `A`) => (`b1`: `B`) => (`b2`: `B`) => `D`

vireostar :: (b -> a -> b -> d) -> a -> b -> b -> d

#### Type parameters

| Name |
| :------ |
| `B` |
| `A` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBAB2D` | (`b`: `B`) => (`a`: `A`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b1`: `B`) => (`b2`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b1`): (`b2`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b1` | `B` |

##### Returns

`fn`

▸ (`b2`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b2` | `B` |

##### Returns

`D`

#### Defined in

index.ts:517

___

### VStarStar

▸ **VStarStar**\<`A`, `C`, `B`, `E`\>(`fnACBC2E`): (`a`: `A`) => (`b`: `B`) => (`c1`: `C`) => (`c2`: `C`) => `E`

vireostarstar :: (a -> c -> b -> c -> e) -> a -> b -> c -> c -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `B` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnACBC2E` | (`a`: `A`) => (`c`: `C`) => (`b`: `B`) => (`c`: `C`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c1`: `C`) => (`c2`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c1`: `C`) => (`c2`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c1`): (`c2`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c1` | `C` |

##### Returns

`fn`

▸ (`c2`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c2` | `C` |

##### Returns

`E`

#### Defined in

index.ts:525

___

### W

▸ **W**\<`A`, `B`\>(`fnAA2B`): (`a`: `A`) => `B`

warbler :: (a -> a -> b) -> a -> b
haskell: join, ramda: unnest, sanctuary: join

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAA2B` | (`a`: `A`) => (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`B`

#### Defined in

index.ts:534

___

### W1

▸ **W1**\<`A`\>(`a`): \<B\>(`fnAA2B`: (`a`: `A`) => (`a`: `A`) => `B`) => `B`

warbler1 :: a -> (a -> a -> b) -> b

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`fnAA2B`): `B`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAA2B` | (`a`: `A`) => (`a`: `A`) => `B` |

##### Returns

`B`

#### Defined in

index.ts:542

___

### WStar

▸ **WStar**\<`A`, `B`, `C`\>(`fnABB2C`): (`a`: `A`) => (`b`: `B`) => `C`

warblerstar :: (a -> b -> b -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABB2C` | (`a`: `A`) => (`b`: `B`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:552

___

### WStarStar

▸ **WStarStar**\<`A`, `B`, `C`, `D`\>(`fnABCC2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

warblerstarstar :: (a -> b -> c -> c -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABCC2D` | (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:560

___

### Y

▸ **Y**(`f`): `any`

haskell: fix, ramda: , sanctuary:

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | `any` |

#### Returns

`any`

#### Defined in

index.ts:178

___

### apply

▸ **apply**\<`A`, `B`\>(`fA2B`): (`a`: `A`) => `B`

applicator :: (a -> b) -> a -> b
haskell: ($), ramda: call, sanctuary: A
applicator, i-star

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`B`

#### Defined in

index.ts:170

___

### becard

▸ **becard**\<`C`, `D`\>(`fnC2D`): \<B\>(`fnB2C`: (`a`: `B`) => `C`) => \<A\>(`fnAToB`: (`a`: `A`) => `B`) => (`a`: `A`) => `D`

becard :: (c -> d) -> (b -> c) -> (a -> b) -> a -> d

#### Type parameters

| Name |
| :------ |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnC2D` | (`a`: `C`) => `D` |

#### Returns

`fn`

▸ \<`B`\>(`fnB2C`): \<A\>(`fnAToB`: (`a`: `A`) => `B`) => (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`a`: `B`) => `C` |

##### Returns

`fn`

▸ \<`A`\>(`fnAToB`): (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAToB` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`D`

#### Defined in

index.ts:184

___

### blackbird

▸ **blackbird**\<`C`, `D`\>(`fnC2D`): \<A, B\>(`fnAB2C`: (`a`: `A`) => (`b`: `B`) => `C`) => (`a`: `A`) => (`b`: `B`) => `D`

blackbird :: (c -> d) -> (a -> b -> c) -> a -> b -> d

Use: 1 <- 2 composition.

λfgab.f(gab) or BBB

#### Type parameters

| Name |
| :------ |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnC2D` | (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`, `B`\>(`fnAB2C`): (`a`: `A`) => (`b`: `B`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:135

___

### bluebird

▸ **bluebird**\<`T`\>(`fnB2C`): \<S\>(`fnA2B`: `S`) => (`a`: `Parameters`\<`S`\>[``0``]) => `ReturnType`\<`T`\>

bluebird :: (b -> c) -> (a -> b) -> a -> c
haskell: (.),fmap, ramda: map, sanctuary: compose, map

Use: 1 <- 1 composition.

λfga.f(ga)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (`b`: `any`) => `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | `T` |

#### Returns

`fn`

▸ \<`S`\>(`fnA2B`): (`a`: `Parameters`\<`S`\>[``0``]) => `ReturnType`\<`T`\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends (`a`: `any`) => `Parameters`\<`T`\>[``0``] |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | `S` |

##### Returns

`fn`

▸ (`a`): `ReturnType`\<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `Parameters`\<`S`\>[``0``] |

##### Returns

`ReturnType`\<`T`\>

#### Defined in

index.ts:69

▸ **bluebird**\<`B`, `C`\>(`fnB2C`): \<A\>(`fnA2B`: (`a`: `A`) => `B`) => (`a`: `A`) => `C`

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2B`): (`a`: `A`) => `C`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:72

___

### bluebirdPrime

▸ **bluebirdPrime**\<`A`, `C`, `D`\>(`fnAC2D`): (`a`: `A`) => \<B\>(`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

bluebird' :: (a -> c -> d) -> a -> (b -> c) -> b -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAC2D` | (`a`: `A`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ (`a`): \<B\>(`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`\>(`fnB2C`): (`b`: `B`) => `D`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:198

___

### bunting

▸ **bunting**\<`D`, `E`\>(`fnD2E`): \<A, B, C\>(`fnABC2D`: (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`) => (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `E`

bunting :: (d -> e) -> (a -> b -> c -> d) -> a -> b -> c -> e

#### Type parameters

| Name |
| :------ |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnD2E` | (`a`: `D`) => `E` |

#### Returns

`fn`

▸ \<`A`, `B`, `C`\>(`fnABC2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `E`

##### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnABC2D` | (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`E`

#### Defined in

index.ts:209

___

### cardinal

▸ **cardinal**\<`A`, `B`, `C`, `T`\>(`fnAB2C`): (`b`: `B`) => (`a`: `A`) => `C`

cardinal :: (a -> b -> c) -> b -> a -> c

haskell: flip, ramda: flip, sanctuary: flip

Use: reverse arguments.
λfab.fba

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `B` | `B` |
| `C` | `C` |
| `T` | extends (`a`: `A`) => (`b`: `B`) => `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | `T` |

#### Returns

`fn`

▸ (`b`): (`a`: `A`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:42

___

### cardinalP

▸ **cardinalP**\<`A`, `C`, `D`\>(`fnCA2D`): \<B\>(`fnB2C`: (`b`: `B`) => `C`) => (`a`: `A`) => (`b`: `B`) => `D`

cardinal' :: (c -> a -> d) -> (b -> c) -> a -> b -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnCA2D` | (`c`: `C`) => (`a`: `A`) => `D` |

#### Returns

`fn`

▸ \<`B`\>(`fnB2C`): (`a`: `A`) => (`b`: `B`) => `D`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:219

___

### cardinalStar

▸ **cardinalStar**\<`A`, `B`, `C`, `D`\>(`fnACB2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

cardinalstar :: (a -> c -> b -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnACB2D` | (`a`: `A`) => (`c`: `C`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:231

___

### cardinalStarStar

▸ **cardinalStarStar**\<`A`, `B`, `C`, `D`, `E`\>(`fnABDC2E`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

cardinalstarstar :: (a -> b -> d -> c -> e) -> a -> b -> c -> d -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABDC2E` | (`a`: `A`) => (`b`: `B`) => (`d`: `D`) => (`c`: `C`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`E`

#### Defined in

index.ts:241

___

### dickcissel

▸ **dickcissel**\<`A`, `B`, `D`, `E`\>(`fnABD2E`): (`a`: `A`) => (`b`: `B`) => \<C\>(`fnC2D`: (`c`: `C`) => `D`) => (`c`: `C`) => `E`

dickcissel :: (a -> b -> d -> e) -> a -> b -> (c -> d) -> c -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABD2E` | (`a`: `A`) => (`b`: `B`) => (`d`: `D`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => \<C\>(`fnC2D`: (`c`: `C`) => `D`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): \<C\>(`fnC2D`: (`c`: `C`) => `D`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnC2D`): (`c`: `C`) => `E`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnC2D` | (`c`: `C`) => `D` |

##### Returns

`fn`

▸ (`c`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`E`

#### Defined in

index.ts:265

___

### dove

▸ **dove**\<`A`, `B`, `C`, `D`\>(`fnAC2D`): (`a`: `A`) => (`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

dove :: (a -> c -> d) -> a -> (b -> c) -> b -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAC2D` | (`a`: `A`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ (`a`): (`fnB2C`: (`b`: `B`) => `C`) => (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`fnB2C`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:253

___

### dovekie

▸ **dovekie**\<`C`, `D`, `E`\>(`fnCD2E`): \<A\>(`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => \<B\>(`fnB2D`: (`b`: `B`) => `D`) => (`b`: `B`) => `E`

dovekie :: (c -> d -> e) -> (a -> c) -> a -> (b -> d) -> b -> e

#### Type parameters

| Name |
| :------ |
| `C` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnCD2E` | (`c`: `C`) => (`d`: `D`) => `E` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2C`): (`a`: `A`) => \<B\>(`fnB2D`: (`b`: `B`) => `D`) => (`b`: `B`) => `E`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`a`): \<B\>(`fnB2D`: (`b`: `B`) => `D`) => (`b`: `B`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`\>(`fnB2D`): (`b`: `B`) => `E`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2D` | (`b`: `B`) => `D` |

##### Returns

`fn`

▸ (`b`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`E`

#### Defined in

index.ts:278

___

### eagle

▸ **eagle**\<`A`, `D`, `E`\>(`fnAD2E`): (`a`: `A`) => \<B, C\>(`fnBC2D`: (`b`: `B`) => (`c`: `C`) => `D`) => (`b`: `B`) => (`c`: `C`) => `E`

eagle :: (a -> d -> e) -> a -> (b -> c -> d) -> b -> c -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `D` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAD2E` | (`a`: `A`) => (`d`: `D`) => `E` |

#### Returns

`fn`

▸ (`a`): \<B, C\>(`fnBC2D`: (`b`: `B`) => (`c`: `C`) => `D`) => (`b`: `B`) => (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`, `C`\>(`fnBC2D`): (`b`: `B`) => (`c`: `C`) => `E`

##### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2D` | (`b`: `B`) => (`c`: `C`) => `D` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`E`

#### Defined in

index.ts:291

___

### eagleBald

▸ **eagleBald**\<`E`, `F`, `G`\>(`fnEF2G`): \<A, B\>(`fnAB2E`: (`a`: `A`) => (`b`: `B`) => `E`) => (`a`: `A`) => (`b`: `B`) => \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

eaglebald :: (e -> f -> g) -> (a -> b -> e) -> a -> b -> (c -> d -> f) -> c -> d -> g

#### Type parameters

| Name |
| :------ |
| `E` |
| `F` |
| `G` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnEF2G` | (`e`: `E`) => (`f`: `F`) => `G` |

#### Returns

`fn`

▸ \<`A`, `B`\>(`fnAB2E`): (`a`: `A`) => (`b`: `B`) => \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

##### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2E` | (`a`: `A`) => (`b`: `B`) => `E` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): \<C, D\>(`fnCD2F`: (`c`: `C`) => (`d`: `D`) => `F`) => (`c`: `C`) => (`d`: `D`) => `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`, `D`\>(`fnCD2F`): (`c`: `C`) => (`d`: `D`) => `G`

##### Type parameters

| Name |
| :------ |
| `C` |
| `D` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnCD2F` | (`c`: `C`) => (`d`: `D`) => `F` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `G`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`G`

#### Defined in

index.ts:302

___

### finch

▸ **finch**\<`A`\>(`a`): \<B\>(`b`: `B`) => \<C\>(`fnBA2C`: (`b`: `B`) => (`a`: `A`) => `C`) => `C`

finch :: a -> b -> (b -> a -> c) -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`b`): \<C\>(`fnBA2C`: (`b`: `B`) => (`a`: `A`) => `C`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnBA2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnBA2C` | (`b`: `B`) => (`a`: `A`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:315

___

### finchStar

▸ **finchStar**\<`A`, `B`, `C`, `D`\>(`fnCBA2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

finchstar :: (c -> b -> a -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnCBA2D` | (`c`: `C`) => (`b`: `B`) => (`a`: `A`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:327

___

### finchStarStar

▸ **finchStarStar**\<`A`, `B`, `C`, `D`\>(`fnADCB2E`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `D`

finchstarstar :: (a -> d -> c -> b -> e) -> a -> b -> c -> d -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnADCB2E` | (`a`: `A`) => (`d`: `D`) => (`c`: `C`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => (`d`: `D`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`D`

#### Defined in

index.ts:335

___

### fixPoint

▸ **fixPoint**(`f`): `any`

haskell: fix, ramda: , sanctuary:

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | `any` |

#### Returns

`any`

#### Defined in

index.ts:178

___

### goldFinch

▸ **goldFinch**\<`B`, `C`, `D`\>(`fnBC2D`): \<A, S\>(`fnA2C`: `S`) => (`a`: `A`) => (`b`: `B`) => `D`

goldfinch :: (b -> c -> d) -> (a -> c) -> a -> b -> d

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2D` | (`b`: `B`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`, `S`\>(`fnA2C`): (`a`: `A`) => (`b`: `B`) => `D`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `S` | extends (`a`: `A`) => `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | `S` |

##### Returns

`fn`

▸ (`a`): (`b`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`D`

#### Defined in

index.ts:343

___

### hummingbird

▸ **hummingbird**\<`A`, `B`, `C`\>(`fnABA2C`): (`a`: `A`) => (`b`: `B`) => `C`

hummingbird :: (a -> b -> a -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABA2C` | (`a`: `A`) => (`b`: `B`) => (`a`: `A`) => `C` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:354

___

### idStar

▸ **idStar**\<`A`, `B`\>(`fnA2B`): (`a`: `A`) => `B`

idstar :: (a -> b) -> a -> b

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`B`

#### Defined in

index.ts:362

___

### idStarStar

▸ **idStarStar**\<`A`, `B`, `C`\>(`fnAB2C`): (`a`: `A`) => (`b`: `B`) => `C`

idstarstar :: (a -> b -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:370

___

### identity

▸ **identity**\<`A`\>(`a`): `A`

haskell: id, ramda: identity, sanctuary: I

λa.a

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`A`

#### Defined in

index.ts:7

___

### jalt

▸ **jalt**\<`A`, `C`\>(`fnA2C`): (`a`: `A`) => \<B\>(`_b`: `B`) => `C`

jalt :: (a -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

#### Returns

`fn`

▸ (`a`): \<B\>(`_b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`B`\>(`_b`): `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `_b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:378

___

### jaltPrime

▸ **jaltPrime**\<`A`, `B`, `D`\>(`fnAB2D`): (`a`: `A`) => (`b`: `B`) => (`_c`: `unknown`) => `D`

jalt' :: (a -> b -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2D` | (`a`: `A`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`_c`: `unknown`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`_c`: `unknown`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`_c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `_c` | `unknown` |

##### Returns

`D`

#### Defined in

index.ts:388

___

### jay

▸ **jay**\<`A`, `B`\>(`fnAB2B`): (`a1`: `A`) => (`b`: `B`) => (`a2`: `A`) => `B`

jay :: (a -> b -> b) -> a -> b -> a -> b

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2B` | (`a`: `A`) => (`b`: `B`) => `B` |

#### Returns

`fn`

▸ (`a1`): (`b`: `B`) => (`a2`: `A`) => `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a1` | `A` |

##### Returns

`fn`

▸ (`b`): (`a2`: `A`) => `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`a2`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a2` | `A` |

##### Returns

`B`

#### Defined in

index.ts:396

___

### kestrel

▸ **kestrel**\<`A`\>(`a`): \<B\>(`_b`: `B`) => `A`

kestrel :: a -> b -> a
haskell: const, ramda: always, sanctuary: K

λab.a

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`_b`): `A`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `_b` | `B` |

##### Returns

`A`

#### Defined in

index.ts:18

___

### kite

▸ **kite**\<`A`\>(`_a`): \<B\>(`b`: `B`) => `B`

kite :: a -> b -> b

λab.b or KI or CK

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`b`): `B`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`B`

#### Defined in

index.ts:28

___

### mockingbird

▸ **mockingbird**\<`T`\>(`fn`): `T`

Mockingbird combinator. Use: self-application.

λf.ff

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`a`: `any`) => `T` |

#### Returns

`T`

#### Defined in

index.ts:53

___

### owl

▸ **owl**\<`A`, `B`\>(`fnF`): (`fnG`: (`fn`: `A`) => `B`) => `B`

owl :: ((a -> b) -> a) -> (a -> b) -> b

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnF` | (`fnG`: (`fn`: `A`) => `B`) => `A` |

#### Returns

`fn`

▸ (`fnG`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnG` | (`fn`: `A`) => `B` |

##### Returns

`B`

#### Defined in

index.ts:404

___

### phoenix

▸ **phoenix**\<`B`, `C`, `D`\>(`fnBC2A`): \<A\>(`fnA2B`: (`a`: `A`) => `B`) => (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

phoenix :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
(Big) Phi combinator - phoenix - Haskell liftM2. This is the same function as starling'.

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2A` | (`b`: `B`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2B`): (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`fnA2C`): (`a`: `A`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`a`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`D`

#### Defined in

index.ts:415

___

### psi

▸ **psi**\<`B`, `C`\>(`fBB2C`): \<A\>(`fA2B`: (`a`: `A`) => `B`) => (`a1`: `A`) => (`a2`: `A`) => `C`

psi :: (b -> b -> c) -> (a -> b) -> a -> a -> c
haskell: on, ramda: , sanctuary: on

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fBB2C` | (`b`: `B`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ \<`A`\>(`fA2B`): (`a1`: `A`) => (`a2`: `A`) => `C`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a1`): (`a2`: `A`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a1` | `A` |

##### Returns

`fn`

▸ (`a2`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a2` | `A` |

##### Returns

`C`

#### Defined in

index.ts:158

___

### quacky

▸ **quacky**\<`A`\>(`a`): \<B\>(`fnA2B`: (`a`: `A`) => `B`) => \<C\>(`fnB2C`: (`b`: `B`) => `C`) => `C`

quacky :: a -> (a -> b) -> (b -> c) -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`fnA2B`): \<C\>(`fnB2C`: (`b`: `B`) => `C`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnB2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:427

___

### queer

▸ **queer**\<`A`, `B`\>(`fnA2B`): \<C\>(`fnB2C`: (`a`: `B`) => `C`) => (`a`: `A`) => `C`

queer :: (a -> b) -> (b -> c) -> a -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ \<`C`\>(`fnB2C`): (`a`: `A`) => `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`a`: `B`) => `C` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:439

___

### quirky

▸ **quirky**\<`A`, `B`\>(`fnA2B`): (`a`: `A`) => \<C\>(`fnB2C`: (`a`: `B`) => `C`) => `C`

quirky :: (a -> b) -> a -> (b -> c) -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): \<C\>(`fnB2C`: (`a`: `B`) => `C`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ \<`C`\>(`fnB2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`a`: `B`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:449

___

### quixotic

▸ **quixotic**\<`B`, `C`\>(`fnB2C`): \<A\>(`a`: `A`) => (`fnA2B`: (`a`: `A`) => `B`) => `C`

quixotic :: (b -> c) -> a -> (a -> b) -> c

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

#### Returns

`fn`

▸ \<`A`\>(`a`): (`fnA2B`: (`a`: `A`) => `B`) => `C`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`fnA2B`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`C`

#### Defined in

index.ts:460

___

### quizzical

▸ **quizzical**\<`A`\>(`a`): \<B, C\>(`fnB2C`: (`b`: `B`) => `C`) => (`fnA2B`: (`a`: `A`) => `B`) => `C`

quizzical :: a -> (b -> c) -> (a -> b) -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`, `C`\>(`fnB2C`): (`fnA2B`: (`a`: `A`) => `B`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnB2C` | (`b`: `B`) => `C` |

##### Returns

`fn`

▸ (`fnA2B`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`C`

#### Defined in

index.ts:472

___

### robin

▸ **robin**\<`A`\>(`a`): \<B, C\>(`fnBA2C`: (`b`: `B`) => (`a`: `A`) => `C`) => (`b`: `B`) => `C`

robin :: a -> (b -> a -> c) -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`, `C`\>(`fnBA2C`): (`b`: `B`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnBA2C` | (`b`: `B`) => (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:484

___

### robinStar

▸ **robinStar**\<`B`, `C`, `A`, `D`\>(`fnBCA2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

robinstar :: (b -> c -> a -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `A` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBCA2D` | (`b`: `B`) => (`c`: `C`) => (`a`: `A`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:494

___

### robinStarStar

▸ **robinStarStar**\<`A`, `C`, `D`, `B`, `E`\>(`fnACDB2E`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

robinstarstar :: (a -> c -> d -> b -> e) -> a -> b -> c -> d -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `D` |
| `B` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnACDB2E` | (`a`: `A`) => (`c`: `C`) => (`d`: `D`) => (`b`: `B`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): (`d`: `D`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`fn`

▸ (`d`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `D` |

##### Returns

`E`

#### Defined in

index.ts:502

___

### starling

▸ **starling**\<`A`, `B`, `C`\>(`fnAB2C`): (`fnA2B`: (`a`: `A`) => `B`) => (`a`: `A`) => `C`

haskell: ap - Applicative's (<*>) on functions., ramda: ap, sanctuary: ap

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ (`fnA2B`): (`a`: `A`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`a`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`C`

#### Defined in

index.ts:147

___

### starlingPrime

▸ **starlingPrime**\<`B`, `C`, `D`\>(`fnBC2A`): \<A\>(`fnA2B`: (`a`: `A`) => `B`) => (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

starling' :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
same function as phoenix

#### Type parameters

| Name |
| :------ |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBC2A` | (`b`: `B`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ \<`A`\>(`fnA2B`): (`fnA2C`: (`a`: `A`) => `C`) => (`a`: `A`) => `D`

##### Type parameters

| Name |
| :------ |
| `A` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`fn`

▸ (`fnA2C`): (`a`: `A`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2C` | (`a`: `A`) => `C` |

##### Returns

`fn`

▸ (`a`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`D`

#### Defined in

index.ts:415

___

### thrush

▸ **thrush**\<`A`\>(`a`): \<B\>(`fnA2B`: (`a`: `A`) => `B`) => `B`

thrush :: a -> (a -> b) -> b

haskell: (&), ramda: applyTo, sanctuary: T

Haskell (#) in Peter Thiemann's Wash, reverse application.

Use: hold an argument.

λaf.fa or CI

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`fnA2B`): `B`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnA2B` | (`a`: `A`) => `B` |

##### Returns

`B`

#### Defined in

index.ts:91

___

### vireo

▸ **vireo**\<`A`\>(`a`): \<B\>(`b`: `B`) => \<C\>(`fnAB2C`: (`a`: `A`) => (`b`: `B`) => `C`) => `C`

vireo :: a -> b -> (a -> b -> c) -> c

Use: hold a pair of arguments.

λabf.fab or BCT

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`b`): \<C\>(`fnAB2C`: (`a`: `A`) => (`b`: `B`) => `C`) => `C`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ \<`C`\>(`fnAB2C`): `C`

##### Type parameters

| Name |
| :------ |
| `C` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAB2C` | (`a`: `A`) => (`b`: `B`) => `C` |

##### Returns

`C`

#### Defined in

index.ts:105

___

### vireoStar

▸ **vireoStar**\<`B`, `A`, `D`\>(`fnBAB2D`): (`a`: `A`) => (`b1`: `B`) => (`b2`: `B`) => `D`

vireostar :: (b -> a -> b -> d) -> a -> b -> b -> d

#### Type parameters

| Name |
| :------ |
| `B` |
| `A` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnBAB2D` | (`b`: `B`) => (`a`: `A`) => (`b`: `B`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b1`: `B`) => (`b2`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b1`): (`b2`: `B`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b1` | `B` |

##### Returns

`fn`

▸ (`b2`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b2` | `B` |

##### Returns

`D`

#### Defined in

index.ts:517

___

### vireoStarStar

▸ **vireoStarStar**\<`A`, `C`, `B`, `E`\>(`fnACBC2E`): (`a`: `A`) => (`b`: `B`) => (`c1`: `C`) => (`c2`: `C`) => `E`

vireostarstar :: (a -> c -> b -> c -> e) -> a -> b -> c -> c -> e

#### Type parameters

| Name |
| :------ |
| `A` |
| `C` |
| `B` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnACBC2E` | (`a`: `A`) => (`c`: `C`) => (`b`: `B`) => (`c`: `C`) => `E` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c1`: `C`) => (`c2`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c1`: `C`) => (`c2`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c1`): (`c2`: `C`) => `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c1` | `C` |

##### Returns

`fn`

▸ (`c2`): `E`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c2` | `C` |

##### Returns

`E`

#### Defined in

index.ts:525

___

### warbler

▸ **warbler**\<`A`, `B`\>(`fnAA2B`): (`a`: `A`) => `B`

warbler :: (a -> a -> b) -> a -> b
haskell: join, ramda: unnest, sanctuary: join

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnAA2B` | (`a`: `A`) => (`a`: `A`) => `B` |

#### Returns

`fn`

▸ (`a`): `B`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`B`

#### Defined in

index.ts:534

___

### warbler1

▸ **warbler1**\<`A`\>(`a`): \<B\>(`fnAA2B`: (`a`: `A`) => (`a`: `A`) => `B`) => `B`

warbler1 :: a -> (a -> a -> b) -> b

#### Type parameters

| Name |
| :------ |
| `A` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

#### Returns

`fn`

▸ \<`B`\>(`fnAA2B`): `B`

##### Type parameters

| Name |
| :------ |
| `B` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `fnAA2B` | (`a`: `A`) => (`a`: `A`) => `B` |

##### Returns

`B`

#### Defined in

index.ts:542

___

### warblerStar

▸ **warblerStar**\<`A`, `B`, `C`\>(`fnABB2C`): (`a`: `A`) => (`b`: `B`) => `C`

warblerstar :: (a -> b -> b -> c) -> a -> b -> c

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABB2C` | (`a`: `A`) => (`b`: `B`) => (`b`: `B`) => `C` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): `C`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`C`

#### Defined in

index.ts:552

___

### warblerStarStar

▸ **warblerStarStar**\<`A`, `B`, `C`, `D`\>(`fnABCC2D`): (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => `D`

warblerstarstar :: (a -> b -> c -> c -> d) -> a -> b -> c -> d

#### Type parameters

| Name |
| :------ |
| `A` |
| `B` |
| `C` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fnABCC2D` | (`a`: `A`) => (`b`: `B`) => (`c`: `C`) => (`c`: `C`) => `D` |

#### Returns

`fn`

▸ (`a`): (`b`: `B`) => (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `A` |

##### Returns

`fn`

▸ (`b`): (`c`: `C`) => `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `b` | `B` |

##### Returns

`fn`

▸ (`c`): `D`

##### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `C` |

##### Returns

`D`

#### Defined in

index.ts:560
