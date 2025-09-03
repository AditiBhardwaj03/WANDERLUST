const express = require("express");
const router = express.Router({ mergeParams: true });
const controller = require("../controllers/review.js");

const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require("../middleware.js");

//rewiews route
router.post("/", isLoggedIn, validateReview, controller.createReview);
//review delete route
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	controller.deleteReview
);

module.exports = router;
