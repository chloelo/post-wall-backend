const bcrypt = require('bcryptjs');
const validator = require('validator');

const { generateSendJWT } = require('../service/auth');
const successHandle = require('../service/successHandle');
const { appError } = require("../service/exceptions");
const handleErrorAsync = require("../service/handleErrorAsync");
const User = require('../models/usersModel')
const Post = require('../models/postsModel');

// 密碼規則：包含英文字母，且八碼以上，不包含特殊符號
const passwordReg = /^(?=.*[a-z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;

const users = {
  signUp: handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError(400, "欄位未填寫正確！", next));
    }
    if(name.trim().length < 2){
      return next(appError(400, "暱稱至少要 2 個字元以上", next));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致！", next));
    }
    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼字數低於 8 碼", next));
    }
    
    if (!passwordReg.test(password)) {
      return next(appError(400, "密碼需至少 8 碼以上，並中英混合，不能有特殊符號", next));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError(400, "Email 格式不正確", next));
    }
    // 檢查信箱有沒有註冊過
    const checkMail = await User.findOne({ email })
    if (checkMail) {
      return next(appError(400, "此信箱已註冊過！", next));
    }
    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      email,
      password,
      name:name.trim()
    });
    generateSendJWT(newUser, 201, res);
  }),

  signIn: handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不可為空', next));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(appError(400, '此帳號尚未註冊過喔！', next));
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, '您的密碼不正確', next));
    }
    generateSendJWT(user, 200, res);
  }),

  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return next(appError(400, '欄位不可為空', next));
    }
    const userOriginal = await User.findById(req.authId).select('+password');
    const compareNewOldPsw = await bcrypt.compare(password, userOriginal.password);
    if (compareNewOldPsw) {
      return next(appError(400, "新密碼與原密碼相同！", next));
    }
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致！", next));
    }
    if (!passwordReg.test(password)) {
      return next(appError(400, "密碼需至少 8 碼以上，並中英混合，不能有特殊符號", next));
    }
    newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.authId, {
      password: newPassword
    });
    generateSendJWT(user, 200, res)
  }),

  getUser: handleErrorAsync(async (req, res, next) => {
    const authData = await User.findById(req.authId);
    successHandle(res, { user: authData })
  }),

  updateUser: handleErrorAsync(async (req, res, next) => {
    const { body } = req
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return next(appError(400, "欄位不可為空", next))
    }
    if (keys.indexOf('name') !== -1 && !body.name.trim()) {
      return next(appError(400, "名字為必填", next))
    }
    const result = await User.findByIdAndUpdate(req.authId, body, { new: true, runValidators: true })
    if (result) {
      successHandle(res, result)
    } else {
      return next(appError(400, "修改檔案失敗", next))
    }
  }),
  getUserLikeList: handleErrorAsync(async (req, res, next) => {
    const likeList = await Post.find({
      likes: { $in: [req.authId] }
    }).populate({
      path: "user",
      select: "name _id"
    });
    successHandle(res, likeList)
  }),
  getUserFollowingList: handleErrorAsync(async (req, res, next) => {
    const followingList = await User.findById(req.authId).populate({
      path: 'following.user',
      select: 'name photo _id'
    })
    successHandle(res, followingList)
  }),
  addFollowing: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.authId) {
      return next(appError(401, '您無法追蹤自己', next));
    }
    await User.updateOne(
      {
        _id: req.authId,
        'following.user': { $ne: req.params.id }// $ne: 不等於
      },
      { // 如果陣列裡沒有就新增
        $addToSet: { following: { user: req.params.id } }
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
        'followers.user': { $ne: req.authId }
      },
      {
        $addToSet: { followers: { user: req.authId } }
      }
    );
    successHandle(res, { message: '您已成功追蹤！' })
  }),
  deleteFollowing: handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.authId) {
      return next(appError(401, '您無法取消追蹤自己', next));
    }
    await User.updateOne(
      {
        _id: req.authId
      },
      {
        $pull: { following: { user: req.params.id } } // $pull 有在陣列裡才刪除
      }
    );
    await User.updateOne(
      {
        _id: req.params.id
      },
      {
        $pull: { followers: { user: req.authId } }
      }
    );
    successHandle(res, { message: '您已成功取消追蹤！' })
  }),
}
module.exports = users