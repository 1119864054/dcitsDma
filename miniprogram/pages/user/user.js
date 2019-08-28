import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";

var dbArticle = new DBArticle();
var dbUser = new DBUser();
const app = getApp()

Page({

  data: {
    username: '',
    avatar: '',
    logged: false,
    checked: true,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  onLoad: function (options) {
    if (app.globalData.logged) {
      this.login()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.login()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        lang: 'zh_CN',
        timeout: 10000,
        success: (res) => {
          console.log('[login] [获取用户信息userInfo] 成功 ', res)
          this.globalData.username = res.userInfo.nickName
          this.globalData.avatar = res.userInfo.avatarUrl
          this.globalData.logged = true
          wx.hideLoading();
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
        },
        fail: () => {
          console.error('[login] [获取用户信息userInfo] 失败')
        }
      });
    }
  },

  onShow: function () {
    this.isNewMessage()
  },

  getUserInfo: function (e) {
    wx.showLoading({
      title: "正在登录",
      mask: true,
    });
    app.globalData.logged = true
    app.globalData.username = e.detail.userInfo.nickName
    app.globalData.avatar = e.detail.userInfo.avatarUrl
    console.log('[login] [getUserInfo] 登录成功', e.detail.userInfo)
    this.login()
  },

  login(e) {
    dbUser.addUser().then(() => {
      this.isNewMessage()
      this.setMyCache()
      dbUser.updateUser()
      let username = app.globalData.username;
      let avatar = app.globalData.avatar;
      let logged = app.globalData.logged;
      this.setData({
        avatar: avatar,
        username: username,
        logged: logged,
        hasUserInfo: true
      })
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })
  },

  onPullDownRefresh() {
    this.login()
  },

  onTapClearCache: function (e) {
    try {
      wx.clearStorageSync();
      console.log('[清除缓存成功]', e)
    } catch (err) {
      console.log('[清除缓存错误]', err)
    }
  },

  isNewMessage() {
    dbArticle.getUncheckedMessage().then(res => {
      if (res.data.length > 0) {
        this.setData({
          checked: false
        })
      } else {
        this.setData({
          checked: true
        })
      }
    })
  },

  setMyCache() {
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.suggestionKey).then(res => {
      dbArticle.setCache('mySuggestion', res)
    })
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.demandKey).then(res => {
      dbArticle.setCache('myDemand', res)
    })
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.technologyKey).then(res => {
      dbArticle.setCache('myTechnology', res)
    })

    // dbArticle.getMyComment().then(res => {
    //   dbArticle.setCache('myComment', res.data)
    // })
  }
})