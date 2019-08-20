import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

const app = getApp();

var myData = {
  articleId: '',
  articleType: '',
};

Page({

  data: {
    comment: [],
  },

  onLoad: function (options) {
    myData.articleId = options.articleId;
    myData.articleType = options.articleType;
    let comment = dbArticle.getCache(options.articleId + '_comment')
    this.setData({
      comment: comment
    })
  },

  onShow: function () {
    this.refresh()
  },

  onPullDownRefresh: function () {
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

  async refresh() {
    let res1 = await dbArticle.getComment(myData.articleId)
    let comment = res1.data
    for (let i = 0; i < comment.length; i++) {
      let userInfo = dbArticle.getCache(comment[i].userId)
      if (userInfo) {
        comment[i].username = userInfo.username
        comment[i].avatar = userInfo.avatar
      } else {
        await dbArticle.getUser(comment[i].userId).then(userInfo => {
          dbArticle.setCache(comment[i].userId, userInfo)
          comment[i].username = userInfo.username
          comment[i].avatar = userInfo.avatar
        })
      }
    }

    console.log('comment', comment);
    dbArticle.setCache(myData.articleId + '_comment', comment)
    this.setData({
      comment: comment
    })
  }
})