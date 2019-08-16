import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

const app = getApp();

Page({

  data: {
    comment: [],
    articleId: '',
  },

  onLoad: function (options) {
    this.setData({
      articleId: options.articleId
    })
  },

  onShow:function(){
    this.refresh()
  },

  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  onTapToAddComment: function () {
    wx.navigateTo({
      url: '/pages/addComment/addComment?articleId=' + this.data.articleId
    });
  },

  refresh: function () {
    this.setData({
      comment: []
    })
    dbArticle.getComment(this.data.articleId).then(res1 => {
      let comment = res1.data
      for (let i = 0; i < comment.length; i++) {
        dbArticle.getUser(comment[i].userId).then(res2 => {
          comment[i].username = res2.username
          comment[i].avatar = res2.avatar
          this.setData({
            comment: this.data.comment.concat(comment[i])
          })
        })
      }
    })
  }
})