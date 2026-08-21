import { serve } from "bun";
import index from "./index.html";

import exerciseHandler from "../api/exercise.ts";

const server = serve({
  routes: {
    "/api/exercise": exerciseHandler,

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
