# Workout logger fetch invocation: diagnosis and fix plan

## Diagnosis

`HttpWorkoutLogService` defaults its injected `request` property to native `fetch`
(`src/service/WorkoutLogService.ts:9`). Calling `this.request(...)` on line 11
supplies the service instance as the native function's receiver (`this`). Browser
`Window.fetch` rejects that incompatible receiver with “Illegal invocation”.

`WorkoutLogger` loads profiles on mount through `presenter.users()`. The resulting
rejection is caught and its message is displayed at the bottom of the logger.
The same shared request helper affects profile creation, saving, and history reads.
The failure occurs before an HTTP request can reach the API.

The existing presenter tests inject a service double; the PostgreSQL tests call
server handlers directly. Neither exercises native browser fetch through the HTTP
service. Successful database tests and compilation therefore missed this defect.

References:
- https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type

## Browser reproduction

Confirmed in isolated headless Chrome using a browser bundle of the current service:

```text
stored native fetch: Failed to execute 'fetch' on 'Window': Illegal invocation
wrapped fetch: 200 []
```

The existing service was instantiated with its default transport and `users()` was
called. A separate object using the proposed forwarding wrapper successfully fetched
a `data:application/json,[]` URL. This establishes the receiver defect and validates
the wrapper independently of database availability. Full application verification
remains part of implementation below.

## Proposed implementation

1. Preserve dependency injection and replace the default raw function reference with
   a forwarding arrow function:

   ```ts
   constructor(
       private readonly request: typeof fetch = (...args) => globalThis.fetch(...args)
   ) {}
   ```

   The arrow ignores the service receiver and calls native fetch on the correct global
   object. Injected test transports continue working. All four service operations use
   this helper, so no presenter, view, database, or API changes are required.

2. Add focused tests for `HttpWorkoutLogService`:
   - Replace global fetch temporarily with a receiver-sensitive function that throws
     unless `this === globalThis`; restore it in `finally`/test cleanup. Instantiate
     the default service and exercise profile loading. This test must fail before
     the fix and pass afterward.
   - Verify injected transports still receive the expected URLs, methods, headers,
     and JSON payloads for users, createUser, history, and save.
   - Verify API errors still reject with the server's error message.

3. Verify the actual browser path at localhost:3000/buildWorkout:
   - Reload with PostgreSQL available; profiles load with no invocation error.
   - Create/select a test profile, record a workout, save it, and reload its history.
   - Confirm expected GET/POST requests and successful responses in the network log.
   - Confirm an unavailable API still produces a useful error message.

4. Run service tests, the existing suite with TEST_DATABASE_URL, and the production
   build. Record any pre-existing TypeScript errors separately.

5. Commit the fix and regression tests together with a conventional message such as
   `fix: preserve browser fetch receiver in workout log service`.

This document is a plan; the application fix has not yet been applied.
