import { expect, test } from "bun:test";
import { productionDatabaseUrl } from "./migrateProduction";

const production = { VERCEL: "1", VERCEL_ENV: "production", DATABASE_URL: "postgres://user:password@db-pooler.neon.tech/app?sslmode=require" };

test("production migration refuses local, preview, absent, and unrelated database targets", () => {
    for (const environment of [
        {}, { ...production, VERCEL: undefined }, { ...production, VERCEL_ENV: "preview" },
        { ...production, DATABASE_URL: undefined },
        { ...production, DATABASE_URL: "postgres://localhost/app" },
        { ...production, DATABASE_URL: "postgres://db.neon.tech.example.com/app" },
        { ...production, DATABASE_URL: "https://db.neon.tech/app" },
    ]) expect(() => productionDatabaseUrl(environment)).toThrow();
});

test("production migration uses the connected unpooled database when provided", () => {
    expect(productionDatabaseUrl(production)).toBe(production.DATABASE_URL);
    const direct = "postgres://user:password@db.neon.tech/app?sslmode=require";
    expect(productionDatabaseUrl({ ...production, DATABASE_URL_UNPOOLED: direct })).toBe(direct);
    expect(() => productionDatabaseUrl({ ...production, DATABASE_URL_UNPOOLED: "postgres://localhost/app" })).toThrow();
});
