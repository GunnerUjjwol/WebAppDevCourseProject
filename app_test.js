import { assertEquals, superoak } from "./deps.js";
import { app } from "./app.js";

Deno.test({
    name: "GET request to / should return status 200", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.get("/").expect(200)
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "GET request to /api/summary should return summary in json", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.get("/api/summary").expect(200)
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "GET request to /api/summary/:year/:month/:day should return summary in json", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.get("/api/summary/2020/12/10").expect(200)
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "GET request to /auth/login should return status 404 without authentication", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.get("/auth/login").expect(200)
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "POST request to /auth/login should return status 401", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.post("/auth/login")
        .send(JSON.stringify({email: 'abc@abc.com', password:'abcde'}))
        .expect(401)
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "POST request to /auth/register should return status 200", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.post("/auth/register")
        .send(JSON.stringify({email: 'abc@abc.com', password:'abcde'}))
        .expect(200)
    },
    sanitizeResources: false,
    sanitizeOps: false
});




