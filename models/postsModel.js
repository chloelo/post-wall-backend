const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Content 未填寫']
    },
    image: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // 表示相關聯到 user 的 collection
      required: [true, "貼文 ID 未填寫"],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
  },
  {
    versionKey: false,
    // 要加以下條件，搭配下方的 virtual，才可以在 populate 的時候成功產出虛擬欄位
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// 掛一個虛擬的欄位 (類存在、類相依、類組合)
// 虛擬的概念，是等到你需要時再呼叫我，我平常不佔效能，有 populate 才會呼叫
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
})

const Post = mongoose.model("Post", postSchema);
module.exports = Post