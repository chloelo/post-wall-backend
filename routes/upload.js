const express = require('express');
const router = express.Router();
const { isAuth } = require('../service/auth');
const upload = require('../service/image');
const fileController = require('../controllers/file')

router.post('/file/image', isAuth, upload, fileController.uploadImg);

module.exports = router;