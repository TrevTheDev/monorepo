import { ValidationErrors } from './schema'

export default class DilavError extends Error {
  constructor(public readonly error: ValidationErrors) {
    super(error.errors.join('\n'))
  }

  get firstError() {
    if (this.error.errors.length === 0) throw new Error('no errors found')
    return this.error.errors[0]
  }
}
