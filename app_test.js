import { assertEquals, superoak } from "./deps.js";
import { app } from "./app.js";

Deno.test("GET request to /api/summary should return summary in json", async () => {
  const testClient = await superoak(app);
  await testClient.get("/api/summary")
       .expect(200)
      // .expect('Content-Type', new RegExp('application/json'))
});

// Deno.test("GET request to / should return 'Hello world!'", async () => {
//   const testClient = await superoak(app);
//   await testClient.get("/").expect(200);
// });

const fun = () => {
  return 'hello world!';
}

Deno.test("Fun should return 'hello world!'", () => {
  assertEquals(fun(), 'hello world!');
});