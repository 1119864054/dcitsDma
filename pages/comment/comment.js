import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

const app = getApp();

var myData = [];

Page({

  data: {
    comment: [],
    articleId: '',
    articleType: ''
  },

  onLoad: function (options) {
    myData.articleId = options.articleId;
    myData.articleType = options.articleType;
  },

  onShow: function () {
    this.refresh()
  },

  onPullDownRefresh: function () {
    this.setData({
      comment: []
    })
    this.refresh()
    wx.stopPullDownRefresh()
  },

  onTapToAddComment: function () {
    if (app.globalData.logged) {
      wx.navigateTo({
        url: '/pages/addComment/addComment?articleId=' + myData.articleId + '&articleType=' + myData.articleType
      });
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      });

    }
  },

  refresh: function () {
    dbArticle.getComment(myData.articleId).then(res1 => {
      let comment = res1.data
      for (let i = 0; i < comment.length; i++) {
        dbArticle.getUser(comment[i].userId).then(res2 => {
          comment[i].username = res2.username
          comment[i].avatar = res2.avatar
          this.setData({
            comment: myData.comment.concat(comment[i])
          })
        })
      }
    })
  }
})