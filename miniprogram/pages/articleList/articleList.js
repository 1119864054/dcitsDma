import {
  DBArticle
} from "../../db/DBArticle";
import {
  DBUser
} from "../../db/DBUser";
import {
  Cache
} from '../../db/Cache';

const dbArticle = new DBArticle();
const dbUser = new DBUser();
const cache = new Cache()

const app = getApp()

import config from '../../util/config.js'

let pageSize = config.getPageSize
let currentPage = 0
let articleType = ['suggestion', 'demand', 'technology']

let timer = 0

Page({

  data: {
    suggestion: [],
    demand: [],
    technology: [],
    loadMore_suggestion: true,
    loadMore_demand: true,
    loadMore_technology: true,
    current: 0,
    windowWidth: '',
    CustomBar: '',
    isLoad: false,
  },

  onLoad: function (options) {
    let suggestionListCache = cache.getCache('suggestion')
    let demandListCache = cache.getCache('demand')
    let technologyListCache = cache.getCache('technology')
    this.setData({
      suggestion: suggestionListCache,
      demand: demandListCache,
      technology: technologyListCache,
      CustomBar: app.globalData.CustomBar,
      windowWidth: app.globalData.windowWidth,
    })
  },

  onShow: function (options) {
    this.getNewData('suggestion')
    this.getNewData('demand')
    this.getNewData('technology')
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getNewData(articleType[this.data.current])
  },

  loadMore: function () {
    let that = this
    timer = setTimeout(function () {
      that.getMoreData(articleType[that.data.current])
    }, 600)
  },

  onTapToArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  tabSelect(e) {
    this.setData({
      current: e.currentTarget.dataset.id
    })
  },

  onSwiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },

  async getMoreData(articleType) {
    console.log('currentPage', currentPage)
    let key = 'loadMore_' + [articleType]
    this.setData({
      [key]: true,
    })

    let that = this;
    let articleList = this.data[articleType]

    let newArticleList = await dbArticle.getAllArticleData(articleType, pageSize, currentPage)
    if (newArticleList && newArticleList.length > 0) {
      currentPage++;
      for (let i = 0; i < newArticleList.length; i++) {
        let user = cache.getCache(newArticleList[i].userId)
        if (!user) {
          user = await dbUser.getUser(newArticleList[i].userId)
          cache.setCache(newArticleList[i].userId, user)
        }
        newArticleList[i].avatar = user.avatar
        newArticleList[i].username = user.username
      }
      articleList = articleList.concat(newArticleList)
      this.setData({
        [articleType]: articleList
      })
      if (newArticleList.length < pageSize) {
        this.setData({
          [key]: false
        })
      }
    } else {
      that.setData({
        [key]: false,
      });
    }
  },

  async getNewData(articleType) {
    let key = 'loadMore_' + [articleType]
    this.setData({
      isLoad: false
    })
    currentPage = 1
    let articleList = await dbArticle.getAllArticleData(articleType)
    if (articleList) {
      for (let i = 0; i < articleList.length; i++) {
        let userInfo = cache.getCache(articleList[i].userId)
        if (!userInfo) {
          userInfo = await dbUser.getUser(articleList[i].userId)
          cache.setCache(articleList[i].userId, userInfo)
        }
        articleList[i].username = userInfo.username
        articleList[i].avatar = userInfo.avatar
        cache.setCache(articleList[i]._id, articleList[i])
      }
      cache.setCache(articleType, articleList)
    }
    console.log(articleType, ' :articleList: ', articleList)
    if (articleList.length < pageSize) {
      this.setData({
        [key]: false
      })
    }
    this.setData({
      [articleType]: articleList,
      isLoad: true
    })
  },

  onTapToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  onTapToNewArticle(e) {
    let articleType = e.currentTarget.dataset.articleType
    let articleId = e.currentTarget.dataset.articleId
    let title = e.currentTarget.dataset.title
    if (articleType == 'suggestion') {
      wx.showModal({
        title: '新的业务需求',
        content: '是否依据需求《' + title + '》加工新的业务需求？',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            this.toNewArticle(articleType, articleId)
          }
        },
        fail: () => {},
        complete: () => {}
      });
    } else if (articleType == 'demand') {
      wx.showModal({
        title: '新的项目需求',
        content: '是否依据业务需求《' + title + '》加工新的项目需求？',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            this.toNewArticle(articleType, articleId)
          }
        },
        fail: () => {},
        complete: () => {}
      });
    }
  },

  toNewArticle(articleType, articleId) {
    if (app.globalData.logged) {
      wx.navigateTo({
        url: '/pages/newArticle/newArticle?articleType=' + articleType + '&articleId=' + articleId
      });
    } else {
      wx.switchTab({
        url: '/pages/user/user',
        success: () => {
          wx.showToast({
            title: '请先登录',
            icon: 'none',
          });
        }
      });
    }
  },

  onHide(){
    clearTimeout(timer)
  }
})