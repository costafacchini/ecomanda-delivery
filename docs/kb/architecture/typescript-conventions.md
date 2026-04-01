# TypeScript Conventions

**Last Updated**: 2026-03-29
**Context**: When writing TypeScript code in this project

## Types
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `unknown` over `any` — force explicit type narrowing
- Use discriminated unions for state machines and variants
- Avoid `as` type assertions — use type guards instead
- Export types alongside their implementations

## Patterns
- Prefer `const` over `let`; never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer `Map`/`Set` over plain objects when keys are dynamic
- Use `readonly` for arrays and objects that shouldn't be mutated
- Prefer named exports over default exports (better refactoring, better tree-shaking)

## Functions
- Use arrow functions for callbacks and short lambdas
- Use function declarations for top-level named functions (hoisting, stack traces)
- Prefer `async/await` over `.then()` chains
- Always handle errors in async functions — unhandled rejections crash Node

## Common Pitfalls
- `===` always, never `==` (type coercion bugs)
- `Promise.all` vs `Promise.allSettled` — use `allSettled` when partial failures are OK
- Array `.sort()` mutates in place — use `toSorted()` (ES2023) or spread+sort
- `typeof null === 'object'` — always check null explicitly before typeof
- Barrel files (`index.ts` re-exports) can hurt tree-shaking — use direct imports in performance-critical code
