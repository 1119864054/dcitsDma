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
    logged: false,
    checked: true,
    hasUserInfo: false,
    loading: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    articleCount: 0,
    favorCount: 0,
    newMessageCount: 0,
    messageCount: 0
  },

  onLoad: function (options) {
    if (app.globalData.logged) {
      this.setMyCache()
      this.setData({
        logged: true,
        hasUserInfo: true
      })
    }
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
    this.setData({
      loading: true
    })
    app.globalData.username = e.detail.userInfo.nickName
    app.globalData.avatar = e.detail.userInfo.avatarUrl
    dbUser.addUser().then(() => {
      app.globalData.logged = true
      this.setData({
        logged: true,
        hasUserInfo: true,
        loading: false
      })
    })
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
        title: '清除缓存出现错误',
        icon: 'none',
      });
    }
  },

  updateUserInfo: function (e) {
    let username = e.detail.userInfo.nickName
    let avatar = e.detail.userInfo.avatarUrl
    cache.removeCache(app.globalData.id)
    dbUser.updateUser(username, avatar).then(() => {
      wx.showToast({
        title: '用户信息更新成功',
        icon: 'none',
      });
    })
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
    dbArticle.getAllArticleData('suggestion', undefined, undefined, app.globalData.id).then(res => {
      cache.setCache('mySuggestion', res)
    })
    dbArticle.getAllArticleData('demand', undefined, undefined, app.globalData.id).then(res => {
      cache.setCache('myDemand', res)
    })
    dbArticle.getAllArticleData('technology', undefined, undefined, app.globalData.id).then(res => {
      cache.setCache('myTechnology', res)
    })
  }
})