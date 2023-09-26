type DoneCb = () => void
type AsyncFunction = (done: DoneCb) => void
/**
 * Enables on to enqueue asynchronous functions that must run sequentially, but
 * that can be enqueued at any time.  Each function is only called after the previous one
 * makes it's `DoneCb`.
 *
 * If no items are in the link list then the function is run as soon as it is added.
 *
 * This is useful for example where multiple requests may come in succession, but one wants only a single
 * request to be resolved at a time.
 * @returns (asyncFunctionToAdd: AsyncFunction) => void
 * @example
 * const linkedList = asyncFunctionLinkedList()
    let data = ''
    linkedList((done) => {
      data += 'A'
      setTimeout(() => {
        linkedList((done3) => {
          data += 'C'
          done3()
          expect(data).toBe('ABC')
          finalDone(undefined)
        })
        done()
      }, 50)
    })
    linkedList((done2) => {
      data += 'B'
      done2()
    })
 *
 */
export default function asyncFunctionLinkedList(): (asyncFunctionToAdd: AsyncFunction) => void {
  // pointer to tail item of linked list
  let lastNodeInLinkedList: ((fnToEnqueue: DoneCb) => void) | undefined
  return function addAsyncFunction(asyncFunction: AsyncFunction): void {
    // links to next item in linked list
    let nextNodeInLinkedList: DoneCb | undefined
    // if item(s) in linked list save link to what is nodes parent
    const parentNodeOrAsyncFn = lastNodeInLinkedList ?? ((dummyFn: () => void) => dummyFn())
    // create new node in linked list
    lastNodeInLinkedList = (fnToEnqueue: DoneCb) => {
      nextNodeInLinkedList = fnToEnqueue
    }
    parentNodeOrAsyncFn(() =>
      // execute cb
      asyncFunction(() => {
        // when cb done, if nextNodeInCbLinkedList, call it
        if (nextNodeInLinkedList) nextNodeInLinkedList()
        // if nothing in linked list, remove it
        else lastNodeInLinkedList = undefined
      }),
    )
  }
}
