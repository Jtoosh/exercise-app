import { test, expect } from "bun:test";
import handler from "./exercise.ts";

test("CDN Proxy returns exercises filtered by muscle", async () => {
  const req = new Request("http://localhost/api/exercise?muscle=chest");
  const res = await handler(req);
  expect(res.status).toBe(200);

  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);

  const first = data[0];
  expect(first).toHaveProperty("name");
  expect(first).toHaveProperty("instructions");
  expect(Array.isArray(first.instructions)).toBe(true);
  expect(first).toHaveProperty("images");
}, 10000);
