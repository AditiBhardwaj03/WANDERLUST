if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

async function main() {
	await mongoose.connect(dbUrl);
}
main()
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB", err);
	});

const store = MongoStore.create({
	mongoUrl: dbUrl,
	crypto: {
		secret: "mysupersecretcode",
	},
	touchAfter: 24 * 3600,
});
store.on("error", () => {
	console.log("Error in MONGO URL", err);
});
const sessionOptions = {
	store,
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currUser = req.user;
	next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);
app.all("/*splat", (req, res, next) => {
	next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
	const { statusCode = 500, message = "Something went wrong!" } = err;
	res.status(statusCode).render("listings/error.ejs", { message });
});

//listen for requests
app.listen(8080, () => {
	console.log(
		"Server is running on port 8080 : http://localhost:8080/listings"
	);
});
