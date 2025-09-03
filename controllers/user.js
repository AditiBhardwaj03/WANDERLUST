const User = require("../models/user.js");
const asyncWrap = require("../utils/wrapAsync.js");

module.exports.signup = (req, res) => {
	res.render("users/signup.ejs");
};
module.exports.createUser = asyncWrap(async (req, res) => {
	try {
		let { username, email, password } = req.body;
		const newUser = new User({ username, email });
		const registeredUser = await User.register(newUser, password);

		req.login(registeredUser, (err) => {
			if (err) {
				return next(err);
			}
			req.flash("success", "Welcome to Wanderlust!");
			res.redirect("/listings");
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("/signup");
	}
});
module.exports.login = (req, res) => {
	res.render("users/login.ejs");
};
module.exports.authenticate = (req, res) => {
	req.flash("success", "Welcome Back to Wanderlust!");
	res.redirect(res.locals.redirectUrl || "/listings");
};
module.exports.logout = (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		req.flash("success", "Successfully Logged Out!");
		res.redirect("/listings");
	});
};
