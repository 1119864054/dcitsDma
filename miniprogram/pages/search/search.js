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
    isLoad: true,
    articleList: '',
    loadMore_suggestion: false,
    loadMore_demand: false,
    loadMore_technology: false,
    current: 0,
    windowWidth: '',
    CustomBar: 0,
    search: ''
  },

  async onLoad(options) {
    this.setData({
      CustomBar: app.globalData.CustomBar,
      windowWidth: app.globalData.windowWidth,
    })
  },

  onTapToSearch(e) {
    let search = e.detail.value
    if (search) {
      this.getNewData(articleType[this.data.current], search)
      this.setData({
        search: search
      })
    }
  },

  onTapToCancel(e) {
    this.setData({
      search: ''
    })
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
    if (this.data.search) {
      this.getNewData(articleType[this.data.current], this.data.search)
    }
  },

  onSwiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },

  async getNewData(articleType, search) {
    let key = 'loadMore_' + [articleType]
    this.setData({
      isLoad: false
    })
    currentPage = 1
    let articleList = await dbArticle.searchArticle(articleType, search)
    if (articleList) {
      for (let i = 0; i < articleList.length; i++) {
        let user = cache.getCache(articleList[i].userId)
        if (!user) {
          user = await dbUser.getUser(articleList[i].userId)
          cache.setCache(articleList[i].userId, user)
        }
        articleList[i].avatar = user.avatar
        articleList[i].username = user.username
        cache.setCache(articleList[i]._id, articleList[i])
        articleList[i].search = search
      }
      cache.setCache(articleType, articleList)
    }
    console.log(articleType, ':articleList:', articleList)
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

  async getMoreData(articleType) {
    console.log('currentPage', currentPage)
    let key = 'loadMore_' + [articleType]
    this.setData({
      [key]: true,
    })

    let that = this;
    let articleList = this.data[articleType]

    let newArticleList = await dbArticle.searchArticle(articleType, this.data.search, pageSize, currentPage)
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
        cache.setCache(articleList[i]._id, articleList[i])
        articleList[i].search = this.data.search
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

  onHide() {
    clearTimeout(timer)
  }
})