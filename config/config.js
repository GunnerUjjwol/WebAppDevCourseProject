import { parse } from "../deps.js";

let config = {};
let DATABASE_URL;


const args = parse(Deno.args);
if (args['d']) {
  DATABASE_URL = args['d'];

} else {
  DATABASE_URL = Deno.env.toObject().DATABASE_URL;
}
console.log(DATABASE_URL);
config.database = DATABASE_URL;


export { config }; 