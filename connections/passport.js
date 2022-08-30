const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/usersModel')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/user/google/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    console.log('profile 111', profile)
    const user = await User.findOne({ googleId: profile.id})
    if(user){
      console.log('使用者已存在')
      return cb(null, user)
    }
    const password = await bcrypt.hash(process.env.GOOGLE_PASSPORT_SECRET, 12)
    const newUser =  await User.create({
      email: profile.emails[0].value,
      name: profile.displayName,
      password,
      googleId:profile.id
    })
    return cb(null, newUser)
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
  }
));