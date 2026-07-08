import { rm, copyFile } from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";


const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];
 await Bun.build({
  entrypoints,
  outdir,
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

await $`bunx @tailwindcss/cli -i ./src/index.css -o ./styles/output.css --minify`;

await copyFile(path.join(outdir, "index.html"), path.join(outdir, "404.html"));
