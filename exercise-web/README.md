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

## Production PostgreSQL on Vercel

The production app is at `https://jamesteuscher.click/exercise-app`; its API lives at
`https://jamesteuscher.click/api/*`. PostgreSQL is a separate managed service, not a
Vercel function or the local Docker database. This app uses Bun SQL directly; no Neon
SDK is required.

### 1. Authenticate and link the existing project

Run these commands from `exercise-web` (the directory containing this README):

```sh
npx vercel login
npx vercel link --project <existing-project-name> --scope <team-slug>
npx vercel whoami
npx vercel integration list
npx vercel env ls production
```

Choose the **existing project serving jamesteuscher.click**, not a new project. Check
its Vercel **Root Directory** is `exercise-web`. The checked-in `vercel.json` selects
Bun (`bunVersion: "1.x"`), runs `bun run build`, serves `dist`, and handles the
`/exercise-app` client routes. Installing dependencies with Bun alone does not select
the Bun function runtime, which is required for `import { SQL } from "bun"`.

If `whoami` reports `login_required`, finish its browser login before continuing.
The connected Vercel app and CLI have separate authentication; a connected app that
lists no teams does not provide access to your project.

### 2. Provision or connect Neon PostgreSQL

First inspect the project's **Storage** tab and `vercel integration list`. Reuse an
existing production database if one is already present; do not create duplicates or
replace a database containing workout history.

For a new database, use **Storage → Create Database → Neon** in Vercel, or:

```sh
npx vercel integration add neon --name exercise-prod --environment production --no-env-pull --metadata auth=false
```

Choose the Free plan if available and a region near the Vercel function region.
Review any account, terms, or billing prompts before accepting. `auth=false` leaves
Neon's optional authentication product disabled; the app currently uses its own
simple profiles. `--no-env-pull` preserves your local development environment files.
The dashboard offers the same provisioning path if CLI installation requires a
browser step. [Neon on Vercel](https://vercel.com/integrations/neon) and the
[Vercel integration CLI reference](https://vercel.com/docs/cli/integration) describe
these options.

Connect the resource to this project's **Production** environment. Use separate
resources or Neon branches for Preview/Development; do not connect them to production
workout data. For a Vercel-managed integration, connection variables are provisioned
when the resource is connected. Verify their names and targets:

```sh
npx vercel env ls production
```

The application requires the exact name **`DATABASE_URL`**. If a resource prefix was
selected, map its connection URL to `DATABASE_URL` in Vercel's environment settings.
Use the provider's PostgreSQL connection string, preserving its TLS options, normally
`sslmode=require`. A hostname such as `localhost`, `127.0.0.1`, or a Docker service
name will not reach your database from Vercel. For a manually managed PostgreSQL
instance, add `DATABASE_URL` to Production in the dashboard yourself.

Do not put credentials in source code, README examples, browser-visible variables,
chat messages, or shell command arguments. This application reads `DATABASE_URL`
only on the server.

### 3. Apply the production schema

After confirming the linked team/project and Production variable, run:

```sh
env -u DATABASE_URL npx vercel env run --environment production -- bun --no-env-file server/db/migrate.ts
```

This command fetches the linked project's production variables for the child process
without saving them to a local file. Clearing the inherited `DATABASE_URL` and
using Bun's `--no-env-file` prevents a missing production variable from silently
falling back to a developer's database. Do not replace it with a bare `bun run
db:migrate` when targeting production: that command can load the local `.env`.
See the [Vercel environment CLI](https://vercel.com/docs/cli/env) and
[Bun environment loading](https://bun.com/docs/runtime/environment-variables).

Expected output: `Database migrations applied.` The migration runner creates
`schema_migrations` and applies `server/db/migrations/001_workout_history.sql`, which
creates `users`, `workouts`, `workout_exercises`, `exercise_sets`, and `workout_totals`.
It runs in a transaction with an advisory lock, and an already-applied migration is
skipped, so retrying is safe. The database role must be allowed to create the tables.
No profiles or sample workouts are seeded; create your profile in the app.

Migrations are explicit and do not run during builds or incoming API requests.
For later schema changes, add a new migration and update the runner to apply it;
do not edit an already-applied SQL file. Take a provider backup or recovery point
before a data-changing migration, and test it on an isolated database first.

### 4. Redeploy and verify

Environment changes apply to new deployments. Redeploy the latest production commit
from Vercel's Deployments tab after provisioning and migration. Then check:

```sh
curl --fail-with-body -i https://jamesteuscher.click/api/users
```

Expect HTTP 200 and a JSON array (`[]` is correct before the first profile exists).
In the app, build a workout, create/select a profile, start the timer, log a set,
complete the circuits, and save. Reload, select the same profile, and confirm the
saved workout appears in history. This verifies persistence, not just the timer.

### Troubleshooting

| Symptom | Check |
| --- | --- |
| `Workout logging is not configured` (503) | Production `DATABASE_URL` exists, contains a PostgreSQL URL, and was included in a new deployment. Confirm the Bun runtime is enabled. This message comes from initialization, before schema queries. |
| `Unable to access workout history` (503) | Inspect Vercel runtime logs for database connection, TLS, permission, or missing-table errors. Confirm migration ran against the same database used by Production. |
| Plain-text 404 or `NOT_FOUND` | Confirm `api/users.ts` and `api/workouts.ts` are deployed from the correct project root; API requests must remain at root `/api/*`. |
| `FUNCTION_INVOCATION_FAILED` | Check function logs and the deployed `vercel.json` runtime configuration. |
| Timer remains disabled | Generate a workout and select/create a profile. A failed profile API prevents profile selection. |
| Works locally only | Local `.env` does not configure Vercel. Check Production scope, resource connection, and redeploy. |

When rotating credentials, update the connected resource/Production variables, repeat
the schema check and redeploy, and verify `/api/users` again. Keep `.env*` secret files
and `.vercel` project-link metadata out of Git.

## Recording a workout

On the workout builder, create/select a profile, generate a workout, and click **Start workout timer**.
Enter each completed set's reps and weight inside its exercise card, alongside the instructions.
Choose kg or lb in the shared workout controls. Use **Skip exercise** to omit an exercise; **Add set**
includes it again. Swapping and regenerating are disabled until the log is saved or discarded. Zero weight supports bodyweight movements; zero reps supports
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
- `src/view/WorkoutLogger.tsx`: shared profile, timer, unit, and save controls.
- `src/view/ExerciseSetLogger.tsx`: set entry composed inside each exercise info card.
- `src/view/WorkoutHistory.tsx`: saved history below the exercise cards.
- `src/hooks/useWorkoutLog.ts`: shared logging state and presenter integration.
- `src/presenter/WorkoutLogPresenter.ts`: logging lifecycle with injected service and clock.
- `src/service/WorkoutLogService.ts`: browser HTTP service.
- `api/users.ts`, `api/workouts.ts`: Vercel function entry points.
- `server/http/`: shared HTTP validation and lazy database initialization for Bun and Vercel.
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
