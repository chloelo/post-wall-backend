const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users')
const { isAuth } = require('../service/auth');

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

module.exports = router;
