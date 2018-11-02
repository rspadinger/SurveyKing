const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const keys = require("./config/keys");

//we import all our DB models => for example the user model is already required in the passport service
require("./models/User");
require("./models/Survey");

//certain functionality blocks are defined in external models => by using require... we make that code available here in the server index.js file
require("./services/passport");

mongoose.Promise = global.Promise;
//we create a connection to our external Mongo DB
mongoose.connect(keys.mongoURI);

//we hook up our express server => express provides various already coded functions that make it easier to work with our node.js server
const app = express();

//app.use... => we define various middleware functions
app.use(bodyParser.json());
//we need cookie managment for authentication
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

//that's how we integrate passport
app.use(passport.initialize());
app.use(passport.session());

//we define all our routes
require("./routes/authRoutes")(app);
require("./routes/billingRoutes")(app);
require("./routes/surveyRoutes")(app);

if (process.env.NODE_ENV === "production") {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static("client/build"));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
