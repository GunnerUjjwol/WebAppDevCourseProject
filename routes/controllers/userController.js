const registrationForm = ({render}) => {
	render('register.ejs', {errors: null, email:'', password: '', authenticated: false})
}

const loginForm = ({render}) => {
	render('login.ejs', {authenticated: false, errors: null})
}
 
export {  registrationForm, loginForm };