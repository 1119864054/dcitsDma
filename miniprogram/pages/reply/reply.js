// miniprogram/pages/reply/reply.js
import {
  DBReply
} from '../../db/DBReply';
import {
  DBComment
} from '../../db/DBComment';
import {
  Cache
} from '../../db/Cache';
import {
  DBUser
} from "../../db/DBUser";

const cache = new Cache()
const dbReply = new DBReply()
const dbComment = new DBComment()
const dbUser = new DBUser()

const app = getApp();

const myData = {
  commentId: '',
  replyContent: ''
}

Page({

  data: {
    comment: '',
    username: '',
    avatar: '',
    reply: []
  },

  onLoad(options) {
    let commentId = options.commentId
    myData.commentId = commentId
    dbComment.getCommentCountById(commentId).then(comment => {
      console.log(comment)
      let userInfo = cache.getCache(comment.userId)
      if (!userInfo) {
        dbUser.getUser(comment.userId).then(userInfo => {
          cache.setCache(comment.userId, userInfo)
          this.setInfo(comment, userInfo)
        })
      }
      this.setInfo(comment, userInfo)
    })

    this.getReply(commentId)
  },

  setInfo(comment, userInfo) {
    this.setData({
      content: comment.content,
      date: comment.date,
      username: userInfo.username,
      avatar: userInfo.avatar,
      myAvatar: app.globalData.avatar,
    })
  },

  getReply(commentId) {
    console.log(commentId)
    dbReply.getReply(commentId).then(replys => {
      for (let i = 0; i < replys.length; i++) {
        let userInfo = cache.getCache(replys[i].userId)
        if (!userInfo) {
          dbUser.getUser(replys[i].userId).then(userInfo => {
            cache.setCache(replys[i].userId, userInfo)
            replys[i].username = userInfo.username
            replys[i].avatar = userInfo.avatar
          })
        }
        replys[i].username = userInfo.username
        replys[i].avatar = userInfo.avatar
      }
      console.log(replys)
      this.setData({
        reply: replys,
        value: ''
      })
    })
  },

  onTapToSubmit: function () {
    let that = this
    if (app.globalData.logged) {
      if (myData.replyContent.length > 0) {
        dbReply.addReply(myData.commentId, myData.replyContent).then(() => {
          that.getReply(myData.commentId)
          myData.replyContent = ''
          dbComment.updateReplyCount(myData.commentId, 1)
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '不能提交空的评论！',
        });
      }
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      });
    }
  },

  getContent: function (e) {
    console.log(e.detail.value)
    myData.replyContent = e.detail.value
  },

  reply(e) {
    let username = e.currentTarget.dataset.username
    this.setData({
      value: '回复 @' + username + ' : '
    })
  },

  onPullDownRefresh: function () {
    this.getReply(myData.commentId)
    wx.stopPullDownRefresh()
  },
})