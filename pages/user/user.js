import { DBArticle } from "../../db/DBArticle";

var dbArticle = new DBArticle();
const app = getApp()

Page({

  data: {
    avatar: '../../images/person/head.svg',
    username: '点击登录',
    sign: '签名',
    logged: false,
  },

  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
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
  },

  onReady: function () {

  },

  onGetUserInfo: function (e) {
    app.globalData.logged = true
    app.globalData.username = e.detail.userInfo.nickName
    app.globalData.avatar = e.detail.userInfo.avatarUrl
    console.log('[login] [onGetUserInfo] 登录成功', e.detail.userInfo)
    this.login()
  },

  login(e) {
    this.onGetOpenid().then(() => {
      dbArticle.addUser().then(() => {
        dbArticle.updateUser()
        let username = app.globalData.username;
        let avatar = app.globalData.avatar;
        let logged = app.globalData.logged;
        this.setData({
          avatar: avatar,
          username: username,
          logged: logged,
        })
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
    dbArticle.getUser(app.globalData.id).then(res => {
      this.setData({
        avatar: res.avatar,
        username: res.username,
        sign: res.sign
      })
      wx.stopPullDownRefresh()
    })
  },

  onTapToMyArticle: function () {
    wx.navigateTo({
      url: '/pages/myArticle/myArticle'
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
})