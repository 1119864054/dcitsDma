import { DBArticle } from "../../db/DBArticle";

var dbArticle = new DBArticle();
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refresh()
    console.log(this.data.userInfo)
  },

  onShow:function(){
    this.refresh()
  },

  onTapLogout: function (e) {
    app.globalData.logged = false;
    wx.redirectTo({
      url: '/pages/login/login',
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
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

  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh: function () {
    this.setData({
      userInfo: dbArticle.checkUserIsExistAndAddUser()[0]
    })
  },
  onTapToMyArticle: function () {
    wx.navigateTo({
      url: '/pages/myArticle/myArticle',
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });

  }
})