import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";

var dbArticle = new DBArticle();
var dbUser = new DBUser();
const app = getApp()

import config from '../../util/config.js'


let pageSize = config.getPageSize
let currentPage = 0
let articleType = ['suggestion', 'demand', 'technology']

Page({

  data: {
    articleList: '',
    loadMore_suggestion: true,
    loadMore_demand: true,
    loadMore_technology: true,
    current: 0,
    windowHeight: '',
    CustomBar: '',
    isLoad: false
  },

  onLoad: function (options) {
    let suggestionListCache = dbArticle.getCache('suggestion')
    let demandListCache = dbArticle.getCache('demand')
    let technologyListCache = dbArticle.getCache('technology')

    this.setData({
      suggestion: suggestionListCache,
      demand: demandListCache,
      technology: technologyListCache,
      CustomBar: app.globalData.CustomBar,
      windowHeight: app.globalData.windowHeight
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

  async getMoreData(articleType) {
    console.log('currentPage——————', currentPage)
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
        let user = dbArticle.getCache(newArticleList[i].userId)
        if (!user) {
          user = await dbUser.getUser(newArticleList[i].userId)
          dbArticle.setCache(newArticleList[i].userId, user)
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
        let userInfo = dbArticle.getCache(articleList[i].userId)
        if (!userInfo) {
          userInfo = await dbUser.getUser(articleList[i].userId)
          dbArticle.setCache(articleList[i].userId, userInfo)
        }
        articleList[i].username = userInfo.username
        articleList[i].avatar = userInfo.avatar
        dbArticle.setCache(articleList[i]._id, articleList[i])
      }
      dbArticle.setCache(articleType, articleList)
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
  }
})