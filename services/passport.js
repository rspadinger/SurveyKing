const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  //null: error ; when we serialize, we take care only of the user.id from the user object
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //in the user model (Table), we search for a user with a specific id, when we get a
  //return from MongoDB, we pas that user to the done function => we deserialize an id into a user object
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });

      //this user is already in our db => just pass it to our done function
      if (existingUser) {
        return done(null, existingUser);
      }

      //if there is no user in our DB yet, we need to create one
      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);
