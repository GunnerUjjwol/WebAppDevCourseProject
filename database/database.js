
import { Client } from "../deps.js";
import { config } from "../config/config.js";
import { Pool } from "../deps.js"

const CONCURRENT_CONNECTIONS = 4;
const connectionPool = new Pool(config.database, CONCURRENT_CONNECTIONS);


const executeQuery = async(query, ...args) => {
  const client = await connectionPool.connect();
  try {
    return await client.query(query, ...args);
  } catch (e) {
    console.log(e);
  }  finally {
      client.release();
  }
}

export { executeQuery };