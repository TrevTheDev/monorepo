import { ResultError } from '@trevthedev/toolbelt'

function a() {
  const x: ResultError<any, any> = [undefined, 1]
  return x
}
console.log(a())
