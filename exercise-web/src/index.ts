import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
    },

    "/api/exercises": async req => {
      const url = new URL(req.url);
      const muscle = url.searchParams.get("muscle");
      const res = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`, {
        headers: {
          "X-Api-Key": process.env.API_NINJAS_KEY!,
        },
      });
      const data = await res.json();
      return Response.json(data);
    },
    
    "/output.css": async () => {
      const file = Bun.file("./dist/output.css");
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": "text/css" },
        });
      }
      return new Response("Not Found", { status: 404 });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
