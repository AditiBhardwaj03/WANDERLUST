const Listing = require("../models/listing.js");
const asyncWrap = require("../utils/wrapAsync.js");
const mapToken = process.env.MAP_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = asyncWrap(async (req, res) => {
	let query = {};
	if (req.query.q) {
		const regex = new RegExp(req.query.q, "i"); // "i" = case-insensitive
		query = {
			$or: [
				{ title: regex },
				{ description: regex },
				{ category: regex },
				{ location: regex },
				{ country: regex },
			],
		};
	}
	if (req.query.category) {
		query.category = req.query.category; // exact match on category
	}
	const allListings = await Listing.find(query);
	res.render("listings/index.ejs", { allListings });
});

module.exports.renderListingForm = (req, res) => {
	res.render("listings/new.ejs");
};
module.exports.showListing = asyncWrap(async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id)
		.populate({ path: "reviews", populate: { path: "author" } })
		.populate("owner");
	if (!listing) {
		req.flash("error", "Listing you are looking for does not exist!");
		return res.redirect("/listings");
	}
	res.render("listings/show.ejs", { listing });
});
module.exports.createListing = asyncWrap(async (req, res, next) => {
	console.log(req.body);
	let response = await geocodingClient
		.forwardGeocode({
			query: req.body.listing.location,
			limit: 1,
		})
		.send();
	let url = req.file.path;
	let filename = req.file.filename;
	const newListing = new Listing(req.body.listing);
	newListing.owner = req.user._id;
	newListing.image = { url, filename };
	newListing.geometry = response.body.features[0].geometry;
	await newListing.save();
	req.flash("success", "New Listing Created!");
	res.redirect("/listings");
});
module.exports.renderEditForm = asyncWrap(async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id);
	if (!listing) {
		req.flash("error", "Listing you are looking for does not exist!");
		return res.redirect("/listings");
	}
	let originalImage = listing.image.url;
	originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");
	res.render("listings/edit.ejs", { listing, originalImage });
});
module.exports.updateListing = asyncWrap(async (req, res) => {
	let { id } = req.params;
	let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
	if (typeof req.file !== "undefined") {
		let url = req.file.path;
		let filename = req.file.filename;
		listing.image = { url, filename };
		await listing.save();
	}
	req.flash("success", "Listing Updated!");
	res.redirect(`/listings/${id}`);
});
module.exports.deleteListing = asyncWrap(async (req, res) => {
	let { id } = req.params;
	let deletedListing = await Listing.findByIdAndDelete(id);
	req.flash("success", "Listing Deleted!");
	console.log(`Deleted listing: ${deletedListing}`);
	res.redirect("/listings");
});
