const express = require('express');
const router = express.Router();
const thirdPartyController = require('../controllers/thirdPartyAuth')
// const { generateUrlJWT } = require('../service/auth');
const passport = require('passport');

router.get('/user/google', passport.authenticate('google', {
  scope: ['email', 'profile'],
}))

// 因為前後端分離，所以不會傳 session, 這邊不設定 false 會噴錯，預設是 true
//                                這是 passport 的 middleware, 會去跑我們設定的 passport.js       
router.get('/user/google/callback', passport.authenticate('google',
  { session: false, successRedirect: "/", failureRedirect: '/sign_in' }),
  thirdPartyController.thirdPartyCallback)


router.get('/user/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

router.get('/user/facebook/callback',
  passport.authenticate('facebook', 
  { session: false, successRedirect: "/", failureRedirect: '/sign_in' }), 
  thirdPartyController.thirdPartyCallback);

module.exports = router;