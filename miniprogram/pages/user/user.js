import { DBArticle } from "../../db/DBArticle";

var dbArticle = new DBArticle();
const app = getApp()

Page({

  data: {
    avatar: '../../images/person/head.svg',
    username: '点击登录',
    sign: '签名',
    logged: false,
    checked: true
  },

  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.showLoading({
            title: "正在登录",
            mask: true,
          });
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            lang: 'zh_CN',
            timeout: 10000,
            success: (res) => {
              console.log('[login] [获取用户信息userInfo] 成功 ', res)
              app.globalData.username = res.userInfo.nickName
              app.globalData.avatar = res.userInfo.avatarUrl
              app.globalData.logged = true
              this.login()
            },
            fail: () => {
              console.error('[login] [获取用户信息userInfo] 失败')
            }
          });
        }
      }
    })

    this.setTabbarCache()
  },

  onShow: function () {
    this.isNewMessage()
  },

  onGetUserInfo: function (e) {
    wx.showLoading({
      title: "正在登录",
      mask: true,
    });
    app.globalData.logged = true
    app.globalData.username = e.detail.userInfo.nickName
    app.globalData.avatar = e.detail.userInfo.avatarUrl
    console.log('[login] [onGetUserInfo] 登录成功', e.detail.userInfo)
    this.login()
  },

  login(e) {
    this.onGetOpenid().then(() => {
      dbArticle.addUser().then(() => {
        this.isNewMessage()
        this.setMyCache()
        dbArticle.updateUser()
        let username = app.globalData.username;
        let avatar = app.globalData.avatar;
        let logged = app.globalData.logged;
        this.setData({
          avatar: avatar,
          username: username,
          logged: logged,
        })
        wx.hideLoading();
        wx.stopPullDownRefresh()
      })
    })
  },

  onGetOpenid: function () {
    // 调用云函数
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数login] [login] [获取openid] 成功: ', res.result.openid)
          app.globalData.openid = res.result.openid
          resolve()
        },
        fail: err => {
          console.error('[云函数login] [login] [获取openid] 失败: ', err)
          reject()
        }
      })
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

  setTabbarCache() {
    dbArticle.getAllArticleData(app.globalData.suggestionKey).then(res => {
      dbArticle.setCache(app.globalData.suggestionKey, res)
    })

    dbArticle.getAllArticleData(app.globalData.demandKey).then(res => {
      dbArticle.setCache(app.globalData.demandKey, res)
    })

    dbArticle.getAllArticleData(app.globalData.technologyKey).then(res => {
      dbArticle.setCache(app.globalData.technologyKey, res)
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

    dbArticle.getMyComment().then(res => {
      dbArticle.setCache('myComment', res.data)
    })
  }
})