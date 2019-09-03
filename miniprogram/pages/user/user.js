import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";
import { Cache } from '../../db/Cache';
import { DBMessage } from '../../db/DBMessage';
import { DBFavor } from '../../db/DBFavor';

var dbArticle = new DBArticle();
var dbUser = new DBUser();
var cache = new Cache()
var dbMessage = new DBMessage()
var dbFavor = new DBFavor()

const app = getApp()

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
    dbMessage.getUncheckedMessage().then(res1 => {
      if (res1.data.length > 0) {
        this.setData({
          checked: false,
          newMessageCount: res1.data.length
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
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.suggestionKey).then(res => {
      cache.setCache('mySuggestion', res)
    })
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.demandKey).then(res => {
      cache.setCache('myDemand', res)
    })
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.technologyKey).then(res => {
      cache.setCache('myTechnology', res)
    })
  }
})