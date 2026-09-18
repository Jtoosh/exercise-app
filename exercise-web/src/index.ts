import { serve } from "bun";
import index from "./index.html";

import exerciseHandler from "../api/exercise.ts";

import { connectDatabase } from "../server/db/database";
import { PostgresWorkoutRepository } from "../server/repository/WorkoutRepository";
import { createWorkoutHandler } from "../api/workouts";

const database = process.env.DATABASE_URL ? connectDatabase() : null;
const workoutHandler = database ? createWorkoutHandler(new PostgresWorkoutRepository(database))
  : () => Response.json({ error: "Configure DATABASE_URL and run bun run db:migrate to enable workout logging." }, { status: 503 });

const server = serve({
  maxRequestBodySize: 1024 * 1024,
  routes: {
    "/api/exercise": exerciseHandler,
    "/api/users": workoutHandler,
    "/api/workouts": workoutHandler,

    "/output.css": async () => {
      const file = Bun.file("./dist/output.css");
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": "text/css" },
        });
      }
      return new Response("Not Found", { status: 404 });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
