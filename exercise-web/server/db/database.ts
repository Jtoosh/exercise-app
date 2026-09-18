import { SQL } from "bun";
export function connectDatabase(url = process.env.DATABASE_URL): SQL {
    if (!url || !/^postgres(ql)?:\/\//.test(url)) throw new Error("Set DATABASE_URL to a PostgreSQL connection URL.");
    return new SQL(url);
}
