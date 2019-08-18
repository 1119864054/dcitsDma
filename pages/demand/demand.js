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
    let demandCache = dbArticle.getCache(app.globalData.demandKey)
    this.setData({
      demand: demandCache
    })
    this.refresh()
  },

  onShow: function (options) {
    
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