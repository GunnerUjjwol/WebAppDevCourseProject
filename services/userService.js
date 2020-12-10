import { executeQuery } from "../database/database.js";
import { bcrypt } from "../deps.js";


const register = async (email, password) => {
   const existingUsers = await executeQuery("SELECT * FROM users WHERE email = $1", email);
  if (existingUsers.rowCount > 0) {
    return "The email is already taken";
  }

  console.log(email, password)
  const hash = await bcrypt.hash(password);
  await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, hash);
  return "ok"
}



export { register }