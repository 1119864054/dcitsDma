import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";
import { Cache } from '../../db/Cache';

var dbArticle = new DBArticle();
var dbUser = new DBUser();
var cache = new Cache()

const app = getApp()

import config from '../../util/config.js'


let pageSize = config.getPageSize
let currentPage = 0
let articleType = ['suggestion', 'demand', 'technology']

var myData = {
  search: ''
}

Page({

  data: {
    isLoad: false,
    articleList: '',
    loadMore_suggestion: true,
    loadMore_demand: true,
    loadMore_technology: true,
    current: 0,
    windowHeight: '',
    CustomBar: 0,
    search: ''
  },

  async onLoad(options) {
    let search = options.search
    myData.search = search

    this.getNewData('suggestion', search)
    this.getNewData('demand', search)
    this.getNewData('technology', search)

    this.setData({
      windowHeight: app.globalData.windowHeight,
      CustomBar: app.globalData.CustomBar,
      search: search
    })
  },

  getSearch(e) {
    myData.search = e.detail.value
  },

  onTapToSearch() {
    this.getNewData(articleType[this.data.current], myData.search)
  },

  loadMore: function () {
    let that = this
    setTimeout(function () {
      that.getMoreData(articleType[that.data.current])
    }, 600)
  },

  onTapToArticle: function (e) {
    console.log(e);
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
    console.log(e)
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
    console.log('currentPage——————', currentPage)
    let key = 'loadMore_' + [articleType]
    this.setData({
      [key]: true,
    })

    let that = this;
    let articleList = this.data[articleType]

    let newArticleList = await dbArticle.searchArticle(articleType, myData.search, pageSize, currentPage)
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
})