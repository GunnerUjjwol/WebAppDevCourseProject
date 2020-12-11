import { assertEquals } from "https://deno.land/std@0.78.0/testing/asserts.ts";
import { register, login } from "./userService.js";

Deno.test({
    name: "REGISTERING WITH EXISTING USER RETURNS EMAIL ALREADY TAKEN", 
    async fn() {
    	await register('asd@gmail.com', '12345678')
        assertEquals(await register('asd@gmail.com', '12345678'), "The email is already taken")
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "LOGGING IN WITH EXISTING USER RETURNS email address of user", 
    async fn() {
    	await register('asd@gmail.com', '12345678')
    	const userObj = await login('asd@gmail.com', '12345678')
        assertEquals(userObj.email, 'asd@gmail.com')
    },
    sanitizeResources: false,
    sanitizeOps: false
});

Deno.test({
    name: "LOGGING IN WITH NON-EXISTING USER RETURNS null", 
    async fn() {
        assertEquals(await login('userdoesnotexist@gmail.com', '12345678'), null)
    },
    sanitizeResources: false,
    sanitizeOps: false
});


