import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    technology: ''
  },

  onLoad: function (options) {
    let technologyCache = dbArticle.getCache(app.globalData.technologyKey)
    this.setData({
      technology: technologyCache
    })
    this.refresh()
  },

  onShow: function (options) {
    
  },

  onPullDownRefresh: function () {
    this.refresh()
  },

  refresh: function () {
    dbArticle.getAllArticleData(app.globalData.technologyKey).then(res => {
      this.setData({
        technology: res
      })
      dbArticle.setCache(app.globalData.technologyKey, res)
      wx.stopPullDownRefresh()
    })
  }
})