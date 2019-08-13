// pages/login/login.js
import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {

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
              console.log('获取用户信息成功 userInfo', res)
              app.globalData.userInfo = res.userInfo
              // this.login()
            },
            fail: () => {
              console.log('获取用户信息失败')
            },
            complete: () => {
              console.log('登录')
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
    console.log('已登录', e.detail.userInfo)
    this.login()
  },

  async login(e) {
    wx.showLoading({
      title: '登录中',
    })
    await this.onGetOpenid()
    await dbArticle.checkUserIsExistAndAddUser()
    wx.hideLoading();
    wx.switchTab({
      url: '/pages/suggestion/suggestion',
      success: (result) => {
        console.log("jump success");
      },
      fail: () => {
        console.log("jump failed");
      },
      complete: () => {
        console.log("jump complete");
      }
    });
  },

  onGetOpenid: function () {
    // 调用云函数
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          app.globalData.openid = res.result.openid
          resolve()
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
          reject()
        }
      })
    })
  },
})