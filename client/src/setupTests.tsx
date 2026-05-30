// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfills for TextEncoder/TextDecoder (required by React Router v7)
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Node 24's bundled undici validates AbortSignal via instanceof against its own
// internal class (captured at startup), which differs from globalThis.AbortSignal.
// Any signal — even a native one — fails the check when react-router passes it to
// new Request() during form-submission navigation. Strip signals from Request
// construction in tests; we don't assert abort/cancellation behaviour.
const OriginalRequest = globalThis.Request
globalThis.Request = new Proxy(OriginalRequest, {
  construct(Target, [input, init = {}]) {
    const { signal: _signal, ...rest } = init
    return new Target(input, rest)
  },
})
