
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const uploadRouter = require('./routes/upload');
const { notFoundHandle } = require('./service');
const { 
  unhandledRejection,
  uncaughtException,
  handleErrorRes 
} = require('./service/exceptions');
const app = express();

// 程式出現重大錯誤時
process.on('uncaughtException', uncaughtException);

require('./connections')


app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', usersRouter);
app.use('/api', postsRouter);
app.use('/api', uploadRouter)
app.use(notFoundHandle);

// 錯誤處理
app.use(handleErrorRes)

// 未捕捉到的 catch 
process.on('unhandledRejection', unhandledRejection);
module.exports = app;
