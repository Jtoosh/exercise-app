# Exercise Web App

A personal workout generator using Bun, React, and a Model–View–Presenter structure.
Requires Bun 1.3.13+ and PostgreSQL 17+ (or Docker Desktop for the provided database).

## Setup

```sh
bun install
docker compose up -d --wait
```

Copy `.env.example` to `.env` (preserve any existing settings), then set:

```dotenv
DATABASE_URL=postgres://exercise:exercise@localhost:5433/exercise
```

Apply migrations and start the app:

```sh
bun run db:migrate
bun dev
```

Migrations are explicit, transactional, locked against concurrent runners, and safe to rerun.
Docker binds the database to localhost and persists its data in the `exercise_db` volume.
`docker compose down` stops it without deleting history. Use your own PostgreSQL URL if preferred.
Without `DATABASE_URL`, generation still works and the logger explains how to enable persistence.

## Recording a workout

On the workout builder, create/select a profile, generate a workout, and click **Start workout timer**.
The logger takes a snapshot of those exercises. Enter each completed set's reps and weight, choose
kg or lb, and remove skipped exercises. Zero weight supports bodyweight movements; zero reps supports
timed exercises. **Finish workout** stops the timer; **Save workout** persists the record. History
shows the most recent 100 workouts with all sets and actual elapsed duration, including rest time.
Unsaved logs live in browser memory and are lost on reload/navigation. Changing weight unit relabels
the entered values; it does not convert them.

Weekly/monthly counts include saved workouts, assigned by finish time in **UTC**. Weeks start Monday;
months are calendar months. Missing periods have zero workouts. Counts are stored in PostgreSQL and
updated in the same transaction as the workout, exercises, and sets. Retrying a save with the same
workout ID is idempotent: the first saved version is retained and counted once. Saved records are immutable.

Profiles identify people; they are **not authentication**. Anyone with access to this personal-use
app can select any profile and read its history. Do not expose it publicly without adding authentication
and server-side authorization. Database credentials stay on the Bun server.

## Structure and API

- `src/lib/workoutLog.ts`: persistence contracts and validation, separate from generated workout estimates.
- `src/view/WorkoutLogger.tsx`: profile, timer, set entry, and history view.
- `src/presenter/WorkoutLogPresenter.ts`: logging lifecycle with injected service and clock.
- `src/service/WorkoutLogService.ts`: browser HTTP service.
- `api/workouts.ts`: validated HTTP handlers with an injected repository.
- `server/repository/WorkoutRepository.ts`: parameterized PostgreSQL queries via Bun SQL.
- `server/db/`: connection configuration and versioned migrations.

`GET /api/users` lists profiles. `POST /api/users` accepts `{ "name": "James" }`.
`GET /api/workouts?userId=<uuid>` returns `{ workouts, totals }` for that profile.
`POST /api/workouts?userId=<uuid>` accepts:

```json
{
  "id": "6c9291bf-f8ef-449b-9782-47b494b5c462",
  "startedAt": "2026-01-01T12:00:00Z",
  "finishedAt": "2026-01-01T12:30:00Z",
  "weightUnit": "kg",
  "exercises": [
    { "exerciseId": "squat", "name": "Squat", "sets": [{ "reps": 10, "weight": 42.5 }] }
  ]
}
```

Validation rejects invalid dates, reversed/excessive durations, empty workouts/sets, negative weights,
and fractional reps. SQL constraints and foreign keys protect relational integrity. No ORM is needed;
[Bun SQL transactions](https://bun.com/docs/runtime/sql) keep each save atomic.

## Verification

```sh
bun test
TEST_DATABASE_URL=postgres://exercise:exercise@localhost:5433/exercise bun run test:db
bun run build
```

The database tests create and drop a uniquely named schema, leaving application data intact. The test
role needs schema-creation permission. Without `TEST_DATABASE_URL`, database tests are skipped.
Set it when running `bun test` to include them in the full suite. Existing exercise API tests require
network access to the exercise CDN. Tests cover round trips, migrations, rollback, retry deduplication,
user separation, calendar boundaries, counters, API validation, and presenter timing.
