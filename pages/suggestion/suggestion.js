import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    suggestion:''
  },

  onLoad: function (options) {
    this.refresh()
  },

  onShow: function (options) {
    
  },
  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },
  refresh: function(){
    this.setData({
      suggestion: dbArticle.getAllArticleData(app.globalData.suggestionKey)
    });
  }
})