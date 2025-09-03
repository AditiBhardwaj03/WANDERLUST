const Joi = require("joi");

module.exports.listingSchema = Joi.object({
	listing: Joi.object({
		title: Joi.string().required(),
		price: Joi.number().required().min(0),
		description: Joi.string().required(),
		location: Joi.string().required(),
		country: Joi.string().required(),
		image: Joi.object({
			url: Joi.string().uri(),
			filename: Joi.string(),
		}).allow(null, ""),
		category: Joi.string().valid(
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
			"boats"
		),
	}).required(),
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5),
		comment: Joi.string().required(),
	}).required(),
});
