const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts')
const { isAuth } = require('../service/auth');

// 取得所有貼文
router.get('/posts', isAuth, postsController.getPosts);

// 新增貼文
router.post('/post', isAuth, postsController.createPost);


// 取得單一貼文
router.get('/post/:id', isAuth, postsController.getPost);

// 新增一則貼文的讚
router.post('/post/:id/like', isAuth, postsController.addPostLike);

// 取消一則貼文的讚
router.delete('/post/:id/like', isAuth, postsController.deletePostLike);

// 新增一則貼文的留言
router.post('/post/:id/comment', isAuth, postsController.addPostComment);

// 取得個人所有貼文列表
router.get('/posts/user/:id', isAuth, postsController.getUserPosts);


// 刪除所有貼文
router.delete('/posts', isAuth, postsController.deletePosts);

// 刪除一筆貼文
router.delete('/post/:id', isAuth, postsController.deletePost);

// 修改一則貼文
router.patch('/post/:id', isAuth, postsController.patchPost);

module.exports = router;