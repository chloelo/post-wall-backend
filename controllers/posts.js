const successHandle = require('../service/successHandle')
const { appError } = require("../service/exceptions");
const handleErrorAsync = require("../service/handleErrorAsync");
const Post = require('../models/postsModel')
const User = require('../models/usersModel')
const Comment = require('../models/commentsModel');

const posts = {
  getPosts: handleErrorAsync(async (req, res) => {
    // asc 遞增 (由小到大，由舊到新) createdAt ; desc 遞減 (由大到小、由新到舊) "-createdAt"
    const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt"
    const q = req.query?.search ? { "content": new RegExp(req.query.search) } : {};
    const allPosts = await Post.find(q)
    .populate({
      path: 'user',
      select: 'name photo '
    }).populate({ // 少了這個 populate，撈出的資料沒有 comments 欄位
      path: 'comments',
      select: 'comment user'
    }).sort(timeSort);

    successHandle(res, allPosts)
  }),
  getPost: handleErrorAsync(async (req, res) => {
    const { id } = req.params
    const post = await Post.findById(id).populate({
      path: 'user',
      select: 'name photo '
    })
    successHandle(res, post)
  }),
  createPost: handleErrorAsync(async (req, res, next) => {
    const { body } = req
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return next(appError(400, "欄位不可為空", next))
    }
    if (body.content.trim()) {
      const newPost = await Post.create({
        user: req.authId,
        image: body.image,
        content: body.content.trim(),
      })
      successHandle(res, newPost)
    } else {
      return next(appError(400, "你沒有填寫 content 資料", next))
    }
  }),
  deletePosts: handleErrorAsync(async (req, res, next) => {
    const userId = req.authId
    const checkUser = await User.findById(userId).select('role')
    if(checkUser.role !== 'super-admin') {
      return next(appError(400, '您沒有權限', next))
    }
    const posts = await Post.deleteMany({})
    successHandle(res, posts)
  }),
  deletePost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params
    const urPost = await Post.find({ user: req.authId, _id: id }, { new: true })
    if (Object.keys(urPost).length === 0) {
      return next(appError(400, "你沒有權限刪除此篇文章喔！", next))
    }
    const result = await Post.findByIdAndDelete(id, { new: true })
    if (result) {
      successHandle(res, result)
    } else {
      return next(appError(400, "查無此 ID", next))
    }
  }),
  patchPost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params
    const { body } = req
    const keys = Object.keys(body)
    const urPost = await Post.find({ user: req.authId, _id: id }, { new: true })
    if (Object.keys(urPost).length === 0) {
      return next(appError(400, "你沒有權限修改此篇文章喔！", next))
    }
    if (keys.length === 0) {
      return next(appError(400, "欄位不可為空", next))
    }
    if (keys.indexOf('content') === -1 && !body.content.trim()) {
      return next(appError(400, "你沒有填寫 content 資料", next))
    }
    const result = await Post.findByIdAndUpdate(id, body, { new: true })
    if (result) {
      successHandle(res, result)
    } else {
      return next(appError(400, "貼文更新失敗", next))
    }

  }),
  addPostLike: handleErrorAsync(async (req, res, next) => {
    const _id = req.params.id;
    const likedBefore = await Post.find(
      {
        _id,
        "likes": {
          $in: [req.authId] // 尋找陣列裡的值，用 $in
        }
      }, { new: true }
    )
    if (likedBefore.length > 0) {
      return next(appError(400, "此篇貼文你已經按過讚了喔！", next))
    }
    const result = await Post.findOneAndUpdate(
      { _id },
      { $addToSet: { likes: req.authId } },
      { new: true }
    );
    successHandle(res, result, 200)
  }),
  deletePostLike: handleErrorAsync(async (req, res, next) => {
    const _id = req.params.id;
    const likedBefore = await Post.find(
      {
        _id,
        "likes": {
          $in: [req.authId] // 尋找陣列裡的值，用 $in
        }
      }, { new: true }
    )
    if (likedBefore.length === 0) {
      return next(appError(400, "此篇貼文你尚未按過讚喔！", next))
    }
    
    const result = await Post.findOneAndUpdate(
      { _id },
      { $pull: { likes: req.authId } }, { new: true }
    );
    successHandle(res, result, 200)
  }),
  addPostComment: handleErrorAsync(async (req, res, next) => {
    const user = req.authId;
    const post = req.params.id;
    const { comment } = req.body;
    if (!comment.trim()) {
      return next(appError(400, "欄位不可為空", next))
    }
    const newComment = await Comment.create({
      post,
      user,
      comment: comment.trim()
    });
    successHandle(res, newComment, 201)
  }),
  getUserPosts: handleErrorAsync(async (req, res) => {
    const user = req.params.id;
    const posts = await Post.find({ user }).populate({
      path: 'comments',
      select: 'comment user'
    });
    successHandle(res, posts, 200)
  }),
}

module.exports = posts
