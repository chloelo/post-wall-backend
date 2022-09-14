const bcrypt = require('bcryptjs');
const User = require('../models/usersModel')
const { generateUrlJWT } = require('../service/auth');
const handleErrorAsync = require("../service/handleErrorAsync");

const thirdPartyAuth = {
  thirdPartyCallback: handleErrorAsync(async (req, res, next) => {
    generateUrlJWT(req.user, res)
  }),
  checkUserId: async (idType, profile) => {
    const user = await User.findOne({ [idType]: profile.id})
    if(user){ // 使用者已存在
      return user
    }
    const password = await bcrypt.hash(process.env.PASSPORT_SECRET, 12)
    const newUser =  await User.create({
      email: profile.emails[0].value,
      name: profile.displayName,
      password,
      [idType]:profile.id
    })
    return newUser
  }
}

module.exports = thirdPartyAuth