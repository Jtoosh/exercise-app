CREATE TABLE users (
    id uuid PRIMARY KEY,
    name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100)
);
CREATE TABLE workouts (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id),
    started_at timestamptz NOT NULL,
    finished_at timestamptz NOT NULL CHECK (finished_at >= started_at),
    duration_seconds integer GENERATED ALWAYS AS (floor(extract(epoch FROM (finished_at - started_at)))::integer) STORED,
    weight_unit text NOT NULL CHECK (weight_unit IN ('kg', 'lb'))
);
CREATE INDEX workouts_user_finished ON workouts(user_id, finished_at DESC);
CREATE TABLE workout_exercises (
    id uuid PRIMARY KEY,
    workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    position integer NOT NULL CHECK (position >= 0),
    exercise_id text NOT NULL,
    name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 200),
    UNIQUE(workout_id, position)
);
CREATE TABLE exercise_sets (
    exercise_id uuid NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    position integer NOT NULL CHECK (position >= 0),
    reps integer NOT NULL CHECK (reps BETWEEN 0 AND 10000),
    weight double precision NOT NULL CHECK (weight BETWEEN 0 AND 10000),
    PRIMARY KEY(exercise_id, position)
);
CREATE TABLE workout_totals (
    user_id uuid NOT NULL REFERENCES users(id),
    period text NOT NULL CHECK (period IN ('week', 'month')),
    period_start date NOT NULL,
    count integer NOT NULL CHECK (count > 0),
    PRIMARY KEY(user_id, period, period_start)
);
