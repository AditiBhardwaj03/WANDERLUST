const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const asyncWrap = require("../utils/wrapAsync.js");

module.exports.createReview = asyncWrap(async (req, res) => {
	let listing = await Listing.findById(req.params.id);
	let newReview = new Review(req.body.review);
	newReview.author = req.user._id;
	listing.reviews.push(newReview);
	await newReview.save();
	await listing.save();
	req.flash("success", "Review Added!");
	res.redirect(`/listings/${listing._id}`);
});

module.exports.deleteReview = asyncWrap(async (req, res) => {
	const { id, reviewId } = req.params;
	await Listing.findByIdAndUpdate(id, {
		$pull: { reviews: reviewId },
	});
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Review Deleted!");
	res.redirect(`/listings/${id}`);
});
