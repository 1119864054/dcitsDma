import { DBArticle } from "../../db/DBArticle";

var dbArticle = new DBArticle();
const app = getApp()

Page({

  data: {
    userInfoDB: app.globalData.userInfoDB
  },

  onLoad: function (options) {
    this.setData({
      userInfoDB: app.globalData.userInfoDB
    })
  },

  onTapLogout: function (e) {
    app.globalData.logged = false;
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },

  onTapClearCache: function (e) {
    try {
      wx.clearStorageSync();
      console.log('[清除缓存成功]', e)
    } catch (err) {
      console.log('[清除缓存错误]', err)
    }
  },

  async onPullDownRefresh() {
    await dbArticle.getUser(app.globalData.id)
    this.setData({
      userInfoDB: app.globalData.userInfoDB
    })
    wx.stopPullDownRefresh()
  },

  onTapToMyArticle: function () {
    wx.navigateTo({
      url: '/pages/myArticle/myArticle'
    });
  }
})