const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const controller = require("../controllers/user.js");

//register route
router.route("/signup").get(controller.signup).post(controller.createUser);

//login route
router
	.route("/login")
	.get(controller.login)
	.post(
		saveRedirectUrl,
		passport.authenticate("local", {
			failureFlash: true,
			failureRedirect: "/login",
		}),
		controller.authenticate
	);

//logout route
router.get("/logout", controller.logout);

module.exports = router;
