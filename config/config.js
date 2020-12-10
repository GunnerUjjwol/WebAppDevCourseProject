let config = {};

if (Deno.env.get('TEST_ENVIRONMENT')) {
  config.database = {};
} else {
  config.database = {
    hostname: "suleiman.db.elephantsql.com",
    database: "wrixwdpg",
    user: "wrixwdpg",
    password: "jHUd-ZVCzanCe0kqkgGxcrd15FMrwbAf",
    port: 5432
  };
}

export { config }; 