const appError = (httpStatus, errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  return error;
  // next(error);
}

// 通常都要寫 catch, 但如果忘記寫，又有錯誤的話，就會跑到下方這個 function，process.on 是 node.js 內建的方法
const unhandledRejection = (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
}

// 可以想像類似註冊一個監聽事件，讓工程師可以查看錯誤訊息是什麼紅字錯誤，非預期行為導致程式掛掉，就會跑這個 error
const uncaughtException = err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error('Uncaughted Exception！')
  console.error(err);
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}

// express 錯誤處理
// 自己設定的 err 錯誤 
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員'
    });
  }
};

// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const handleErrorRes = (err, req, res, next) => {
  err.statusCode = err.statusCode || 400;
  if (err instanceof SyntaxError && 'body' in err) {
    err.message = "欄位格式錯誤"
    err.isOperational = true;
  }
  if (err.name === 'CastError') {
    err.message = "路徑找不到此 ID，請再次確認！"
    err.isOperational = true;
  }
  if (err.name === 'ValidationError') {
    err.message = "資料欄位未填寫正確，請重新輸入！"
    err.isOperational = true;
  }
  // dev
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }
  // production
  resErrorProd(err, res)
}
module.exports = {
  appError,
  unhandledRejection,
  uncaughtException,
  handleErrorRes
}