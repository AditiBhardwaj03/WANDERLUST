const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config();

const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

main()
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Failed to connect to MongoDB", err));

async function main() {
	await mongoose.connect(MONGO_URL);
}

const categories = [
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
];

const initDB = async () => {
	await Listing.deleteMany({});

	for (let obj of initData.data) {
		// Get coordinates for location
		let geoData = await geocodingClient
			.forwardGeocode({
				query: `${obj.location}, ${obj.country}`,
				limit: 1,
			})
			.send();

		let coordinates = [78.9629, 20.5937]; // fallback (India center)
		if (geoData && geoData.body.features && geoData.body.features.length > 0) {
			coordinates = geoData.body.features[0].geometry.coordinates;
		}

		const listing = new Listing({
			...obj,
			owner: "68ab6398a2c6b3cfdfe7cead",
			category:
				obj.category ||
				categories[Math.floor(Math.random() * categories.length)],
			geometry: {
				type: "Point",
				coordinates,
			},
		});

		await listing.save();
	}

	console.log("✅ Database initialized with geocoded data!");
};

initDB();
