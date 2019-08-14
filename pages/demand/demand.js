import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    demand: ''
  },

  onLoad: function (options) {
    this.refresh()
  },

  onShow: function (options) {
    let demandCache = dbArticle.getCache(app.globalData.demandKey)
    this.setData({
      demand: demandCache
    })
  },

  onPullDownRefresh: function () {
    this.refresh()
  },

  refresh: function () {
    dbArticle.getAllArticleData(app.globalData.demandKey).then(res => {
      this.setData({
        demand: res
      })
      dbArticle.setCache(app.globalData.demandKey, res)
      wx.stopPullDownRefresh()
    })
  }
})