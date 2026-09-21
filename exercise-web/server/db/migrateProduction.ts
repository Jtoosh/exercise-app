import { connectDatabase } from "./database";
import { migrate } from "./migrate";

export function productionDatabaseUrl(environment: Record<string, string | undefined>): string {
    if (environment.VERCEL_ENV !== "production" || environment.VERCEL !== "1" || !environment.DATABASE_URL)
        throw new Error("Run this migration inside a Vercel production build with DATABASE_URL configured.");
    const value = environment.DATABASE_URL_UNPOOLED || environment.DATABASE_URL;
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname.endsWith(".neon.tech"))
        throw new Error("Expected the connected production Neon database; refusing another target.");
    return value;
}

if (import.meta.main) {
    const database = connectDatabase(productionDatabaseUrl(process.env));
    try {
        await migrate(database);
        const migrations = await database`SELECT name FROM schema_migrations ORDER BY name`;
        const tables = await database`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
        console.log("Production Neon migration verified", JSON.stringify({
            migrations: migrations.map(row => row.name), tables: tables.map(row => row.tablename),
        }));
    } finally { await database.close(); }
}
