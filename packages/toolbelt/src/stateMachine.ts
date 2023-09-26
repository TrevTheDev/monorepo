/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/ban-types */
// import { Identity } from './typescriptUtils'

type Transition = readonly [
  from: string,
  to: readonly [string, ...string[]],
  beforeTransitionFn?: () => boolean | void,
  afterTransitionFn?: () => void,
]

type Transitions = readonly [Transition, ...Transition[]]

type GetFromStates<T extends Transitions> = { [I in keyof T]: T[I][0] }[number]
type GetToStates<T extends Transitions> = { [I in keyof T]: T[I][1][number] }[number]

export type ObjectWrappedWithStateMachine<
  Base extends object,
  ToStates extends string,
  States extends string,
  StateGetterKey extends PropertyKey | null = 'state',
  ToStateKey extends PropertyKey | null = 'toState',
> = Base &
  (StateGetterKey extends infer T1 extends PropertyKey ? { readonly [P in T1]: States } : {}) &
  (ToStateKey extends infer T3 extends PropertyKey
    ? {
        [P in T3]: (
          state: ToStates,
        ) => ObjectWrappedWithStateMachine<Base, ToStates, States, StateGetterKey, ToStateKey>
      }
    : {}) extends infer FO
  ? { [P in keyof FO]: FO[P] }
  : {}

function invalidCall(state: string, validStates: string[]) {
  throw new Error(`state is ${state} and must be in ${validStates} to call`)
}

/**
 * Wraps an object in a simple state machine in order to track object state.
 *
 * **example**
 * ```typescript
 *  const sm = addStateMachine({
 *   // baseObject is the input object which has a state machine wrapped around it
 *   baseObject: {
 *     cancel() {
 *       this.toState('cancel')
 *     },
 *   },
 *   // all allowed transitions (i.e. the arrows in a state machine diagram)
 *   transitions: [
 *     ['A', ['B', 'cancel']],
 *     ['B', ['cancel']],
 *   ],
 *   // before allowing a property to be called, it must be in one of these states
 *   beforeCallGuards: [['cancel', ['A', 'B']]],
 * })
 * console.log(sm.state) // 'A'
 * sm.toState('B')
 * console.log(sm.state) // 'B'
 * expect(() => sm.toState('A')).toThrow() // invalid transitions throw, alternatively
 * // a function can be provided to handle
 * // invalid transitions
 * console.log(sm.state) // 'B'
 * sm.cancel()
 * console.log(sm.state) // 'cancel'
 *
 * type StateMachineDefinition = {
 *   // the object to wrap in a state machine
 *   baseObject: object,
 *   // an array of all valid transitions
 *   // type Transition = readonly [
 *   //   from: string,
 *   //   to: [string, ...string[]],
 *   //   // called before the transition, if `false` is returned then the transition
 *   //   // wont occur
 *   //   beforeTransitionFn?: () => boolean | void,
 *   //   // called after the transition
 *   //   afterTransitionFn?: () => void,
 *   // ]
 *   transitions: [Transition, ...Transition[]]
 *   // before allowing a property to be called, it must be in one of these states
 *   beforeCallGuards?: [
 *     [ propOrMethod: keyof baseObject, validStates: States[], invalidStateFn?: () => void ],
 *     ...[ propOrMethod: keyof baseObject, validStates: States[], invalidStateFn?: () => void ][]
 *   ]
 *   // called before any transitions and before `beforeTransitionFn`.  If a different
 *   // state is returned then the state machine will attempt to transition to that state
 *   beforeStateTransitions?: (newState: States, oldState: States) => States | undefined
 *   // called after any transitions and after `afterTransitionFn`.
 *   afterStateTransitions?: (newState: States, oldState: States) => void
 *   // called if a transition was attempted which doesn't exist in `transitions`.
 *   invalidTransitionFn?: (newState: States, oldState: States) => void
 *   // the property key to use for the state getter - by default this is `state`
 *   // if `null` is specified then a state getter will not be defined on the object
 *   stateGetterKey?: States
 *   // the property key to use for the to state function - by default this is `toState`
 *   // if `null` is specified then a sto state function will not be defined on the object
 *   // in that case the return from `addStateMachine` will be an array of the form:
 *   //    [stateMachineObject: object, toStateFn: (newState: ToStates) => stateMachineObject, getStateFn: () => States]
 *   toStateKey?: States
 * }
 *
 * ```
 *
 * @param {StateMachineOptions} stateMachineDefinition
 * @returns
 */
export default function addStateMachine<
  Base extends object,
  const T extends Transitions,
  StateGetterKey extends PropertyKey | null = 'state',
  ToStateKey extends PropertyKey | null = 'toState',
  ToStates extends string = GetToStates<T>,
  FromStates extends string = GetFromStates<T>,
  States extends string = FromStates | ToStates,
  O extends object = ObjectWrappedWithStateMachine<
    Base,
    ToStates,
    States,
    StateGetterKey,
    ToStateKey
  >,
  RT = ToStateKey extends null
    ? [object: O, toStateFn: (newState: ToStates) => O, getStateFn: () => States]
    : O,
>(stateMachineDefinition: {
  baseObject: Base
  transitions: T
  beforeStateTransitions?: (newState: ToStates, oldState: FromStates) => ToStates | undefined
  afterStateTransitions?: (newState: ToStates, oldState: FromStates) => void
  invalidTransitionFn?: (newState: ToStates, oldState: FromStates) => void
  stateGetterKey?: StateGetterKey
  toStateKey?: ToStateKey
  beforeCallGuards?: [
    [
      propOrMethod: keyof Base,
      validStates: GetToStates<T> | GetFromStates<T>[],
      invalidStateFn?: () => void,
    ],
    ...[
      propOrMethod: keyof Base,
      validStates: GetToStates<T> | GetFromStates<T>[],
      invalidStateFn?: () => void,
    ][],
  ]
}): RT {
  const {
    baseObject,
    transitions,
    beforeStateTransitions,
    afterStateTransitions,
    stateGetterKey = 'state',
    toStateKey = 'toState',
    invalidTransitionFn = (newState, oldState) => {
      throw new Error(`transition from ${oldState} to ${newState} not found`)
    },
    beforeCallGuards,
  } = stateMachineDefinition
  let state = transitions[0][0] as States

  const target = Object.create(baseObject) as O

  // let toStates = [] as ToStates[]
  // let fromStates = [] as FromStates[]
  // for (const transition of transitions) {
  //   toStates = [...toStates, ...transition[1]]
  //   fromStates.push(transition[0])
  // }
  // toStates = [...new Set(toStates)]
  // fromStates = [...new Set(fromStates)]
  // const allStates = [...new Set([...toStates, ...fromStates])] as States[]

  function getState() {
    return state
  }

  if (stateGetterKey !== null) {
    Object.defineProperty(target, stateGetterKey, {
      get() {
        return getState()
      },
    })
  }

  function toState(newState: ToStates): O {
    let found = false
    const oldState = state
    for (const transition of transitions) {
      if (transition[0] === state && transition[1].includes(newState)) {
        found = true
        const [, , beforeTransitionFn, afterTransitionFn] = transition

        if (beforeStateTransitions) {
          const subState = beforeStateTransitions(newState, state as unknown as FromStates)
          if (subState !== undefined) if (subState !== newState) return toState(subState)
        }

        if (beforeTransitionFn !== undefined) {
          const shouldTransition = beforeTransitionFn()
          if (shouldTransition === false) break
        }
        state = newState as unknown as States
        if (afterTransitionFn !== undefined) afterTransitionFn()

        if (afterStateTransitions) afterStateTransitions(newState, state as unknown as FromStates)

        break
      }
    }
    if (found === false) invalidTransitionFn(newState, oldState as unknown as FromStates)
    return target
  }

  if (beforeCallGuards) {
    for (const beforeCallGuard of beforeCallGuards) {
      const [key, validStates, invalidStateFn = invalidCall] = beforeCallGuard
      const propDef = Object.getOwnPropertyDescriptor(baseObject, key)
      if (propDef === undefined)
        throw new Error(`beforeCallGuard ${String(key)} doesn't exist in object`)
      else if ('get' in propDef && propDef.get !== undefined) {
        Object.defineProperty(target, key, {
          ...propDef,
          get() {
            if (!validStates.includes(state)) invalidStateFn(state, validStates as string[])
            return propDef.get!.apply(target)
          },
        })
      } else if ('set' in propDef && propDef.set !== undefined) {
        Object.defineProperty(target, key, {
          ...propDef,
          set(value) {
            if (!validStates.includes(state)) invalidStateFn(state, validStates as string[])
            return propDef.set!.apply(target, [value])
          },
        })
      } else if ('value' in propDef) {
        if (typeof propDef.value !== 'function') throw new Error('not a function')
        Object.defineProperty(target, key, {
          ...propDef,
          value(...args) {
            if (!validStates.includes(state)) invalidStateFn(state, validStates as string[])
            return propDef.value.apply(target, args)
          },
        })
      } else throw new Error(`${String(key)} type is unhandled`)
    }
  }

  if (toStateKey !== null) {
    Object.defineProperty(target, toStateKey, { value: toState })
    return target as unknown as RT
  }

  return [target, toState, () => state] as RT
}
