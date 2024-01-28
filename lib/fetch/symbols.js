'use strict'

let kHeaders
let kSignal
let kState
let kRealm

// If we're running in a node environment, we need to use the symbols from the
// global Request instance, so that we can use them to access the internal
// properties of our Request instance.
if (globalThis.Request) {
  const globalRequestInstance = new globalThis.Request('http://foo.com')

  Object.getOwnPropertySymbols(globalRequestInstance).forEach(symbol => {
    switch (symbol.description) {
      case 'headers':
        kHeaders = symbol
        break
      case 'signal':
        kSignal = symbol
        break
      case 'state':
        kState = symbol
        break
      case 'realm':
        kRealm = symbol
        break
    }
  })
}

module.exports = {
  kUrl: Symbol('url'),
  kGuard: Symbol('guard'),
  kHeaders: kHeaders || Symbol('headers'),
  kSignal: kSignal || Symbol('signal'),
  kState: kState || Symbol('state'),
  kRealm: kRealm || Symbol('realm')
}
