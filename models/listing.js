const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
	title: { type: String, required: true },
	description: String,
	price: Number,
	location: String,
	image: {
		url: String,
		filename: String,
	},
	country: String,
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: "Review",
		},
	],
	owner: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	geometry: {
		type: {
			type: String,
			enum: ["Point"],
			required: true,
		},
		coordinates: {
			type: [Number],
			required: true,
		},
	},
	category: {
		type: String,
		enum: [
			"trending",
			"rooms",
			"iconic cities",
			"mountains",
			"castles",
			"amazing pools",
			"camping",
			"farms",
			"Arctic",
			"domes",
			"boats",
		],
	},
});
listingSchema.post("findOneAndDelete", async function (listing) {
	if (listing) {
		await Review.deleteMany({
			_id: {
				$in: listing.reviews,
			},
		});
	}
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
