import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refresh()
  },

  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  onTapToArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  refresh() {
    this.setData({
      comment: []
    })
    dbArticle.getMyComment().then(res1 => {
      let comment = res1.data
      for (let i = 0; i < comment.length; i++) {
        dbArticle.getArticleByAIdFromDB(comment[i].articleId, comment[i].articleType).then(res2 => {
          comment[i].title = res2[0].title
          this.setData({
            comment: this.data.comment.concat(comment[i])
          })
        })
      }
    })
  }
})