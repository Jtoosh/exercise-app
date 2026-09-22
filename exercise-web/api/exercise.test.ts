import { test, expect, beforeAll, spyOn } from "bun:test";
import handler from "./exercise.ts";

beforeAll(async () => {
  const catalog = [
    { id: "press", name: "Press", category: "strength", equipment: "dumbbell", primaryMuscles: ["chest", "biceps"] },
    { id: "bench", name: "Bench", category: "powerlifting", equipment: "barbell", primaryMuscles: ["chest", "biceps"] },
    { id: "fly", name: "Fly", category: "strength", equipment: "cable", primaryMuscles: ["chest"] },
    { id: "jump", name: "Jump", category: "plyometrics", equipment: null, primaryMuscles: ["quadriceps"] },
  ].map(exercise => ({ ...exercise, instructions: ["Start"], images: [] }));
  const request = spyOn(globalThis, "fetch").mockResolvedValue(Response.json(catalog));
  try { await handler(new Request("http://localhost/api/exercise")); }
  finally { request.mockRestore(); }
});

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


for (const category of ["strength", "powerlifting", "strength,powerlifting", "strength&category=powerlifting"]) {
  test(`category filter supports ${category}`, async () => {
    const response = await handler(new Request(`http://localhost/api/exercise?muscle=chest&category=${category}`));
    const exercises = await response.json();
    expect(exercises.length).toBeGreaterThan(0);
    const allowed = category.split(/,|&category=/);
    expect(exercises.every((exercise: any) => allowed.includes(exercise.category))).toBe(true);
  });
}

test("any category is unrestricted and an unavailable combination stays empty", async () => {
  const all = await (await handler(new Request("http://localhost/api/exercise"))).json();
  const any = await (await handler(new Request("http://localhost/api/exercise?category=any"))).json();
  expect(any).toEqual(all);
  const empty = await (await handler(new Request("http://localhost/api/exercise?muscle=chest&category=plyometrics"))).json();
  expect(empty).toEqual([]);
});
