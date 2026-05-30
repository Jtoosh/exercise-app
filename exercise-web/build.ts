import { rm } from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";


const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
  entrypoints,
  outdir,
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

await $`bunx @tailwindcss/cli -i ./src/index.css -o ./dist/output.css --minify`;

const indexPath = path.join(outdir, "index.html");
const html = await Bun.file(indexPath).text();
const updated = html.replace(
  "</head>",
  '<link rel="stylesheet" href="./output.css">\n</head>'
);
await Bun.write(indexPath, updated);

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}
