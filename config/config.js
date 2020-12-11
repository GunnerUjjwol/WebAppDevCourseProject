let config = {};
const DATABASE_URL = Deno.env.toObject().DATABASE_URL;
console.log(DATABASE_URL);

if (Deno.env.get('TEST_ENVIRONMENT')) {
  config.database = {
    hostname: "suleiman.db.elephantsql.com",
    database: "wrixwdpg",
    user: "wrixwdpg",
    password: "jHUd-ZVCzanCe0kqkgGxcrd15FMrwbAf",
    port: 5432
  };
} else {
  config.database = DATABASE_URL;
}

export { config }; 