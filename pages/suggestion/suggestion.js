import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    suggestion: ''
  },

  onLoad: function (options) {
    this.refresh()
  },

  onShow: function (options) {
    let suggestionCache = dbArticle.getCache(app.globalData.suggestionKey)
    this.setData({
      suggestion: suggestionCache
    })
  },

  onPullDownRefresh: function () {
    this.refresh()
  },

  refresh: function () {
    dbArticle.getAllArticleData(app.globalData.suggestionKey).then(res => {
      this.setData({
        suggestion: res
      })
      dbArticle.setCache(app.globalData.suggestionKey, res)
      wx.stopPullDownRefresh()
    })
  }
})