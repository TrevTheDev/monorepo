import { SingleValidationError, ValidationErrors } from './types'

export default class ValidationError extends Error {
  readonly input: unknown

  readonly errors: SingleValidationError[]

  readonly errorObject: ValidationErrors

  constructor(errors: ValidationErrors) {
    const msg = errors.errors.join(', ')
    super(msg)
    this.errors = errors.errors
    this.input = errors.input
    this.errorObject = errors
  }

  get firstError() {
    if (this.errors.length === 0) throw new Error('no errors found')
    return this.errors[0]
  }
}
