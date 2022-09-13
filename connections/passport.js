const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');

const thirdPartyController = require('../controllers/thirdPartyAuth')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/user/google/callback"
    // https://post-wall-backend.vercel.app/api/user/facebook/callback
  },
  async (accessToken, refreshToken, profile, cb) => {
    console.log('profile: ', profile)
    return(null, await thirdPartyController.checkUserId('googleId', profile))
  }
));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/api/user/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email'],
  enableProof: true
  },
  async (accessToken, refreshToken, profile, cb) => {
    console.log('fb profile: ', profile)
    return(null, await thirdPartyController.checkUserId('facebookId', profile))
  }
)); 