const express = require("express");
const router = express.Router();

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const controller = require("../controllers/listing.js");
const multer = require("multer");

const { storage } = require("../cloudConfig.js");
const wrapAsync = require("../utils/wrapAsync.js");
const upload = multer({ storage });

//index route
router
	.route("/")
	.get(controller.index)
	.post(
		isLoggedIn,
		upload.single("listing[image]"),
		validateListing,
		controller.createListing
	);

//new route
router.get("/new", isLoggedIn, controller.renderListingForm);

// show route
router
	.route("/:id")
	.get(controller.showListing)
	.delete(isLoggedIn, isOwner, controller.deleteListing)
	.put(
		isLoggedIn,
		isOwner,
		upload.single("listing[image]"),
		validateListing,
		controller.updateListing
	);

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, controller.renderEditForm);

module.exports = router;
