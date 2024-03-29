const multer = require('multer');
const path = require('path');
const { appError } = require("./exceptions");

const upload = multer({
  limits: {
    fileSize: 2*1024*1024, // 2mb
  },
  fileFilter(req, file, cb) { // cb = callback
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg' && ext !== '.gif') {

      cb(appError(400, "檔案格式錯誤，僅限上傳 jpg、jpeg、png 與 gif 格式。"));
    }
    cb(null, true);
  },
}).any();

module.exports = upload 