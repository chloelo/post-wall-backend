const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users')
const { isAuth, generateUrlJWT } = require('../service/auth');
const passport = require('passport');

// 註冊會員
router.post('/sign_up', usersController.signUp);

// 登入會員
router.post('/sign_in', usersController.signIn);

// 重設密碼
router.patch('/user/password', isAuth, usersController.updatePassword);

// 取得個人資料
router.get('/user/profile', isAuth, usersController.getUser);

// 更新個人資料
router.patch('/user/profile', isAuth, usersController.updateUser);

// 取得個人按讚列表
router.get('/user/like_list', isAuth, usersController.getUserLikeList);

// 取得個人追蹤名單
router.get('/user/following', isAuth, usersController.getUserFollowingList);

// 追蹤朋友
router.post('/user/:id/following', isAuth, usersController.addFollowing);

// 取消追蹤朋友
router.delete('/user/:id/following', isAuth, usersController.deleteFollowing);

// router.get('/user/google', passport.authenticate('google', {
//   scope: ['email', 'profile'],
// }))

// // 因為前後端分離，所以不會傳 session, 這邊不設定 false 會噴錯，預設是 true
// //                                這是 passport 的 middleware, 會去跑我們設定的 passport.js 的 callback function      
// router.get('/user/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
//   // res.send({
// 	// 	status:true,
// 	// 	data:req.user
// 	// })
//   generateUrlJWT(req.user, res)
// })

module.exports = router;
