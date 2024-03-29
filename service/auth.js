const jwt = require('jsonwebtoken');
const { appError } = require("./exceptions");
const handleErrorAsync = require('./handleErrorAsync')
const User = require('../models/usersModel')

const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(appError(401, '你尚未登入！', next));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return next(appError(401, '你的登入時效已過期！', next));
        }
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })
  // req.user = await User.findById(decoded.id);
  req.authId = decoded.id;
  next();
});

const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    user: {
      token,
      name: user.name
    }
  });
}
const generateUrlJWT = (user, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined // 保險起見
  // 重新導向到前端，如果是 heroku url or github-pages, 記得要用絕對路徑把正確 url 加上
  // 前端再從網址取得 token
  res.redirect(`/callback?token=${token}&name=${user.name}`)
}

module.exports = {
  isAuth,
  generateSendJWT,
  generateUrlJWT
}