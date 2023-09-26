import { it, expect } from 'vitest'
import { addStateMachine } from '../src'

it.skip('basic usage - stateMachine', () => {
  const sm = addStateMachine({
    // baseObject is the input object which has a state machine wrapped around it
    baseObject: {
      cancel() {
        this.toState('cancel')
      },
    },
    // all allowed transitions (i.e. the arrows in a state machine diagram)
    transitions: [
      ['A', ['B', 'cancel']],
      ['B', ['cancel']],
    ],
    // before allowing a property to be called, it must be in one of these states
    beforeCallGuards: [['cancel', ['A', 'B']]],
  })
  console.log(sm.state) // 'A'
  sm.toState('B')
  console.log(sm.state) // 'B'
  expect(() => sm.toState('A' as 'B')).toThrow() // invalid transitions throw, alternatively
  // a function can be provided to handle
  // invalid transitions
  console.log(sm.state) // 'B'
  sm.cancel()
  console.log(sm.state) // 'cancel'
})
it.skip('options - stateMachine', () => {
  // type StateMachineDefinition = {
  //   // the object to wrap in a state machine
  //   baseObject: object,
  //   // an array of all valid transitions
  //   // type Transition = readonly [
  //   //   from: string,
  //   //   to: [string, ...string[]],
  //   //   // called before the transition, if `false` is returned then the transition
  //   //   // wont occur
  //   //   beforeTransitionFn?: () => boolean | void,
  //   //   // called after the transition
  //   //   afterTransitionFn?: () => void,
  //   // ]
  //   transitions: [Transition, ...Transition[]]
  //   // before allowing a property to be called, it must be in one of these states
  //   beforeCallGuards?: [
  //     [ propOrMethod: keyof baseObject, validStates: States[], invalidStateFn?: () => void ],
  //     ...[ propOrMethod: keyof baseObject, validStates: States[], invalidStateFn?: () => void ][]
  //   ]
  //   // called before any transitions and before `beforeTransitionFn`.  If a different
  //   // state is returned then the state machine will attempt to transition to that state
  //   beforeStateTransitions?: (newState: States, oldState: States) => States | undefined
  //   // called after any transitions and after `afterTransitionFn`.
  //   afterStateTransitions?: (newState: States, oldState: States) => void
  //   // called if a transition was attempted which doesn't exist in `transitions`.
  //   invalidTransitionFn?: (newState: States, oldState: States) => void
  //   // the property key to use for the state getter - by default this is `state`
  //   // if `null` is specified then a state getter will not be defined on the object
  //   stateGetterKey?: States
  //   // the property key to use for the to state function - by default this is `toState`
  //   // if `null` is specified then a sto state function will not be defined on the object
  //   // in that case the return from `addStateMachine` will be an array of the form:
  //   //    [stateMachineObject: object, toStateFn: (newState: ToStates) => stateMachineObject, getStateFn: () => States]
  //   toStateKey?: States
  // }
})
it('stateMachine', () => {
  const sm = addStateMachine({
    baseObject: {},
    transitions: [
      ['A', ['B']],
      ['B', ['C']],
      ['C', ['D']],
    ],
  })
  expect(sm.state).toEqual('A')
  sm.toState('B')
  expect(sm.state).toEqual('B')
  expect(() => sm.toState('A' as 'B')).toThrow()
  expect(sm.state).toEqual('B')
  sm.toState('C')
  expect(sm.state).toEqual('C')
})
it('no set state', () => {
  const [sm, toState, state] = addStateMachine({
    baseObject: {},
    transitions: [
      ['A', ['B']],
      ['B', ['C']],
      ['C', ['D']],
    ],
    toStateKey: null,
    stateGetterKey: null,
  })
  expect('toState' in sm).toBeFalsy()
  expect('state' in sm).toBeFalsy()
  expect(state()).toEqual('A')
  toState('B')
  expect(state()).toEqual('B')
})
it('named state fn', () => {
  const sm = addStateMachine({
    baseObject: {},
    transitions: [
      ['A', ['B']],
      ['B', ['C']],
      ['C', ['D']],
    ],
    toStateKey: 'setTheState',
    stateGetterKey: 'getTheState',
  })
  expect(sm.getTheState).toEqual('A')
  sm.setTheState('B')
  expect(sm.getTheState).toEqual('B')
})
it('transitions', () => {
  let board = 'A'
  const sm = addStateMachine({
    baseObject: {},
    transitions: [
      [
        'A',
        ['B'],
        () => {
          if (board === 'A') {
            board = 'B'
            return false
          }
          expect(board).toEqual('B')
          board = 'C'
          return true
        },
        () => {
          expect(board).toEqual('C')
          board = 'D'
        },
      ],
      ['B', ['C']],
      ['C', ['D']],
    ],
    beforeStateTransitions: (newState, oldState) => {
      console.log(`bT: ${oldState}->${newState}`)
      return newState
    },
    afterStateTransitions: (newState, oldState) => {
      console.log(`aT: ${oldState}->${newState}`)
    },
  })
  expect(sm.state).toEqual('A')
  sm.toState('B')
  expect(sm.state).toEqual('A')
  sm.toState('B')
  expect(sm.state).toEqual('B')
})
it('beforeCallGuards', () => {
  const sm = addStateMachine({
    baseObject: {
      a(value) {
        expect(value).toBe('a')
        expect(sm.state).toBe('A')
      },
      b(value) {
        expect(value).toBe('b')
      },
      c(value) {
        expect(value).toBe('c')
      },
    },
    transitions: [
      ['A', ['B']],
      ['B', ['C']],
      ['C', ['D']],
    ],
    beforeCallGuards: [
      [
        'a',
        ['A'],
        () => {
          throw new Error(`INVALID STATE`)
        },
      ],
      ['b', ['A', 'B']],
      ['c', ['A']],
    ],
  })
  sm.a('a')
  sm.b('b')
  sm.toState('B')
  expect(() => sm.a('a')).toThrowError('INVALID STATE')
  sm.b('b')
  expect(() => sm.c('c')).toThrowError('state is B and must be in A to call')
})

it('getters, setters and fns', () => {
  let value
  const sm = addStateMachine({
    baseObject: {
      get a() {
        debugger
        return value
      },
      set b(arg) {
        debugger
        value = arg
      },
      setB(arg) {
        debugger
        value = arg
      },
    },
    transitions: [
      ['A', ['B']],
      ['B', ['C']],
      ['C', ['D']],
    ],
    beforeCallGuards: [
      ['a', ['A']],
      ['b', ['A']],
      ['setB', ['A']],
    ],
  })
  sm.setB('a')
  expect(sm.a).toEqual('a')
  sm.b = 'b'
  expect(sm.a).toEqual('b')
  sm.toState('B')
  expect(() => sm.a).toThrow()
  expect(() => sm.setB('c')).toThrow()
  expect(() => {
    sm.b = 'c'
  }).toThrow()
})
