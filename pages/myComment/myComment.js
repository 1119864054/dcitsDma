import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment:[]
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

  refresh: function () {
    dbArticle.getMyComment().then(res => {
      this.setData({
        comment: res.data
      })
    })
  }
})