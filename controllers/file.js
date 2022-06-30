const { successHandle } = require('../service')
const { appError } = require("../service/exceptions");
const handleErrorAsync = require("../service/handleErrorAsync");
const sizeOf = require('image-size'); // 偵測圖片大小
const { ImgurClient } = require('imgur');
const file = {
  uploadImg: handleErrorAsync(async (req, res, next) => {
    // multer 把 files 封裝處理帶入 req，所以 req.files 可以直接取得資料
    if (!req.files.length) {
      return next(appError(400, "尚未上傳檔案", next));
    }
    const dimensions = sizeOf(req.files[0].buffer);
    if (dimensions.width !== dimensions.height) {
      return next(appError(400, "圖片長寬不符合 1:1 尺寸。", next))
    }
    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENTID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN,
    });
    const response = await client.upload({
      image: req.files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.IMGUR_ALBUM_ID
    });
    successHandle(res, {
      imgUrl: response.data.link
    })
  })
}
module.exports = file