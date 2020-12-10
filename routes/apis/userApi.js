

import * as userService from "../../services/userService.js"
import { executeQuery } from "../../database/database.js";
import { bcrypt, validate, required, isNumeric,lengthBetween, isEmail } from "../../deps.js";

const validationRules = {
    password: [required, lengthBetween(4, 20)],
    email: [required, isEmail]
};

const data = {
    email: '',
    password: '',
    errors: []
};
const register = async({render, request, response}) => {
  data.errors = null;
	const body = request.body();
	const params = await body.value;
	data.email = params.get('email');
  data.password = params.get('password');
  const [passes, errors] = await validate(data, validationRules);
  data.errors = errors;
  console.log(passes, errors)
  if(passes){
    const registrationStatus = await userService.register(data.email, data.password)
    console.log(registrationStatus)
    if(registrationStatus === "ok"){
      response.redirect('/auth/login')
    } else {
      data.errors.email = {emailStatus : registrationStatus};
      render('register.ejs', {...data, authenticated: false})
    }
    
  }else {
    render('register.ejs', {...data, authenticated: false})
  }
	

}

const authenticate = async({request, response, session}) => {

  const body = request.body();
  const params = await body.value;

  const email = params.get('email');
  const password = params.get('password');

  // check if the email exists in the database
  const res = await executeQuery("SELECT * FROM users WHERE email = $1;", email);
  
  if (res.rowCount === 0) {
      response.status = 401;
      return;
  }

  // take the first row from the results
  const userObj = res.rowsOfObjects()[0];
  const hash = userObj.password;

  const passwordCorrect = await bcrypt.compare(password, hash);
  if (!passwordCorrect) {
      response.status = 401;
      return;
  }

  await session.set('authenticated', true);
  await session.set('user', {
      id: userObj.id,
      email: userObj.email
  });
  console.log(await session.get('authenticated'));
  console.log(await session.get('user'));
  response.redirect('/behavior/reportSelection')
}

const logout = async({session, response}) => {
	await session.set('authenticated', false);
	await session.set('user', null)
	response.redirect('/auth/login')
}
   
export { register, authenticate, logout };