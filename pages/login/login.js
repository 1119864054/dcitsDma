// pages/login/login.js
import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    loading: false
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
              app.globalData.userInfo = res.userInfo
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

  onGetUserInfo: function (e) {
    if (!app.globalData.logged && e.detail.userInfo) {
      app.globalData.logged = true
      app.globalData.userInfo = e.detail.userInfo
    }
    console.log('登录成功', e.detail.userInfo)
    this.login()
  },

  async login(e) {
    this.setData({
      loading: true
    })
    await this.onGetOpenid()
    await dbArticle.addUser()
    await dbArticle.updateUser()
    await dbArticle.getUser()
    wx.switchTab({
      url: '/pages/suggestion/suggestion'
    });
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
})