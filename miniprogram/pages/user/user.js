import {
  DBArticle
} from "../../db/DBArticle";
import {
  DBUser
} from "../../db/DBUser";
import {
  Cache
} from '../../db/Cache';
import {
  DBMessage
} from '../../db/DBMessage';
import {
  DBFavor
} from '../../db/DBFavor';

const dbArticle = new DBArticle();
const dbUser = new DBUser();
const cache = new Cache()
const dbMessage = new DBMessage()
const dbFavor = new DBFavor()

const app = getApp()
const log = require('../../util/log.js')

Page({

  data: {
    username: '',
    avatar: '',
    logged: false,
    checked: true,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    articleCount: 0,
    favorCount: 0,
    newMessageCount: 0,
    messageCount: 0
  },

  onLoad: function (options) {
    if (app.globalData.logged) {
      this.login()
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.login()
      }
    }
    // else {
    //   wx.getUserInfo({
    //     lang: 'zh_CN',
    //     timeout: 10000,
    //     success: (res) => {
    //       console.log('[user] [获取用户信息userInfo] 成功 ', res)
    //       log.info('[user] [获取用户信息userInfo] 成功 ', res)
    //       this.globalData.username = res.userInfo.nickName
    //       this.globalData.avatar = res.userInfo.avatarUrl
    //       this.globalData.logged = true
    //       wx.hideLoading();
    //       if (this.userInfoReadyCallback) {
    //         this.userInfoReadyCallback(res)
    //       }
    //     },
    //     fail: () => {
    //       console.error('[user] [获取用户信息userInfo] 失败')
    //     }
    //   });
    // }
  },

  onShow: function () {
    if (app.globalData.logged) {
      this.isNewMessage()
      dbArticle.getArticleCount().then(articleCount => {
        this.setData({
          articleCount: articleCount
        })
      })
      dbFavor.getFavorCount().then(favorCount => {
        this.setData({
          favorCount: favorCount
        })
      })
    }

  },

  getUserInfo: function (e) {
    let that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.showLoading({
            title: "正在登录",
            mask: true,
          });
          wx.getUserInfo({
            success(res) {
              console.log("[user] [获取用户信息userInfo] 成功 ", res)
              app.globalData.logged = true
              app.globalData.username = res.userInfo.nickName
              app.globalData.avatar = res.userInfo.avatarUrl
              that.login()
            },
            fail(err) {
              console.error("[user] [获取用户信息userInfo] 失败", err)
              log.error("[user] [获取用户信息userInfo] 失败", err)
            }
          })
        }
      }
    })
  },

  login(e) {
    dbUser.addUser().then(() => {
      this.setMyCache()
      dbUser.updateUser()
      this.setData({
        avatar: app.globalData.avatar,
        username: app.globalData.username,
        logged: app.globalData.logged,
        point: app.globalData.point,
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
      wx.showToast({
        title: '清除缓存成功',
        icon: 'none',
      });
    } catch (err) {
      wx.showToast({
        title: '清除缓存错误',
        icon: 'none',
      });
    }
  },

  isNewMessage() {
    dbMessage.getUncheckedMessage().then(res1 => {
      if (res1.length > 0) {
        this.setData({
          checked: false,
          newMessageCount: res1.length
        })
      } else {
        dbMessage.getMessageCount().then(res2 => {
          this.setData({
            checked: true,
            messageCount: res2
          })
        })
      }
    })
  },

  setMyCache() {
    dbArticle.getAllArticleData(app.globalData.suggestionKey, undefined, undefined, app.globalData.id).then(res => {
      cache.setCache('mySuggestion', res)
    })
    dbArticle.getAllArticleData(app.globalData.demandKey, undefined, undefined, app.globalData.id).then(res => {
      cache.setCache('myDemand', res)
    })
    dbArticle.getAllArticleData(app.globalData.technologyKey, undefined, undefined, app.globalData.id).then(res => {
      cache.setCache('myTechnology', res)
    })
  }
})