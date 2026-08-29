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

test("CDN Proxy filters exercises by equipment", async () => {
  const req = new Request("http://localhost/api/exercise?muscle=chest&equipment=dumbbell,barbell");
  const res = await handler(req);
  expect(res.status).toBe(200);

  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
  data.forEach((ex: any) => {
    const eq = (ex.equipment || "body only").toLowerCase();
    expect(["dumbbell", "barbell"]).toContain(eq);
  });
}, 10000);

test("CDN Proxy filters exercises by resistance type", async () => {
  const req = new Request("http://localhost/api/exercise?muscle=chest&resistance=cable_machine");
  const res = await handler(req);
  expect(res.status).toBe(200);

  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
  data.forEach((ex: any) => {
    const eq = (ex.equipment || "body only").toLowerCase();
    expect(["cable", "machine", "bands", "foam roll"]).toContain(eq);
  });
}, 10000);

test("CDN Proxy excludes specified exercise IDs", async () => {
  const reqAll = new Request("http://localhost/api/exercise?muscle=biceps");
  const resAll = await handler(reqAll);
  const dataAll = await resAll.json();
  expect(dataAll.length).toBeGreaterThan(1);

  const excludeId = dataAll[0].id || dataAll[0].name;
  const reqExcluded = new Request(`http://localhost/api/exercise?muscle=biceps&exclude=${encodeURIComponent(excludeId)}`);
  const resExcluded = await handler(reqExcluded);
  const dataExcluded = await resExcluded.json();

  expect(dataExcluded.some((ex: any) => (ex.id || ex.name).toLowerCase() === excludeId.toLowerCase())).toBe(false);
}, 10000);

