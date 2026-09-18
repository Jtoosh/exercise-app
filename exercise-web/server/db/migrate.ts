import type { SQL } from "bun";
import { connectDatabase } from "./database";
export async function migrate(database: SQL): Promise<void> {
    await database.begin(async transaction => {
        await transaction`SELECT pg_advisory_xact_lock(72914501)`;
        await transaction`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY)`;
        const name = "001_workout_history.sql";
        const applied = await transaction`SELECT name FROM schema_migrations WHERE name = ${name}`;
        if (!applied.length) {
            await transaction.file(new URL(`./migrations/${name}`, import.meta.url).pathname);
            await transaction`INSERT INTO schema_migrations VALUES (${name})`;
        }
    });
}
if (import.meta.main) {
    const database = connectDatabase();
    try { await migrate(database); console.log("Database migrations applied."); }
    finally { await database.close(); }
}
