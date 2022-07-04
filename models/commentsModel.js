const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'comment can not be empty!']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: ['true', 'user must belong to a post.']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      require: ['true', 'comment must belong to a post.']
    }
  }, {
    versionKey: false,
  }
);
// /^find/ 正規表達式，表示 find 開頭
// 只要是 find 開頭的方法， findAndUpdate(),findID...都是符合的
// 前置器，前台有用到 find collection 語法就會觸發
// 如果沒有這段 populate，user 欄位就只會顯示預設的 ObjectId
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name id createdAt'
  });
  next();
});
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;