import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";
import { Cache } from '../../db/Cache';
import { DBFavor } from '../../db/DBFavor';

const dbArticle = new DBArticle();
const dbUser = new DBUser();
const cache = new Cache()
const dbFavor = new DBFavor()

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myFavorList: [],
    current: 0,
    windowWidth: '',
    CustomBar: '',
    isLoad: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let favorSuggestion = [], favorDemand = [], favorTechnology = []
    favorSuggestion = cache.getCache('favorSuggestion')
    favorDemand = cache.getCache('favorDemand')
    favorTechnology = cache.getCache('favorTechnology')
    let myFavorList = []
    myFavorList.push(favorSuggestion)
    myFavorList.push(favorDemand)
    myFavorList.push(favorTechnology)
    this.setData({
      CustomBar: app.globalData.CustomBar,
      windowWidth: app.globalData.windowWidth,
      myFavorList: myFavorList
    })
    this.getFavor()
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

  onTapToArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  onTapToUnfavor(e) {
    wx.showLoading({
      title: '取消收藏',
      mask: true,
    });

    let that = this
    
    dbFavor.removeFavor(e.currentTarget.dataset.favorId).then(res => {
      dbArticle.updateFavorCount(e.currentTarget.dataset.articleId, e.currentTarget.dataset.articleType, -1)
      that.getFavor()
      wx.hideLoading();
    })
  },

  async getFavor() {
    this.setData({
      isLoad: false
    })

    let favorSuggestion = []
    let sugList = await dbFavor.getFavor(app.globalData.suggestionKey)
    if (sugList) {
      for (let i = 0; i < sugList.length; i++) {
        let article = cache.getCache(sugList[i].articleId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(sugList[i].articleId, app.globalData.suggestionKey))[0]
          cache.setCache(sugList[i].articleId, article)
        }
        let user = cache.getCache(article.userId)
        if (!user) {
          user = await dbUser.getUser(article.userId)
          cache.setCache(article.userId, user)
        }
        article.username = user.username
        article.avatar = user.avatar
        article.favorId = sugList[i]._id
        favorSuggestion = favorSuggestion.concat(article)
      }
      console.log('favorSuggestion', favorSuggestion);
      cache.setCache('favorSuggestion', favorSuggestion)
    }

    let favorDemand = []
    let demList = await dbFavor.getFavor(app.globalData.demandKey)
    if (demList) {
      for (let i = 0; i < demList.length; i++) {
        let article = cache.getCache(demList[i].articleId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(demList[i].articleId, app.globalData.demandKey))[0]
          cache.setCache(demList[i].articleId, article)
        }
        let user = cache.getCache(article.userId)
        if (!user) {
          user = await dbUser.getUser(article.userId)
          cache.setCache(article.userId, user)
        }
        article.username = user.username
        article.avatar = user.avatar
        article.favorId = demList[i]._id
        favorDemand = favorDemand.concat(article)
      }
      console.log('favorDemand', favorDemand);
      cache.setCache('favorDemand', favorDemand)
    }

    let favorTechnology = []
    let tecList = await dbFavor.getFavor(app.globalData.technologyKey)
    if (tecList) {
      for (let i = 0; i < tecList.length; i++) {
        let article = cache.getCache(tecList[i].articleId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(tecList[i].articleId, app.globalData.technologyKey))[0]
          cache.setCache(tecList[i].articleId, article)
        }
        let user = cache.getCache(article.userId)
        if (!user) {
          user = await dbUser.getUser(article.userId)
          cache.setCache(article.userId, user)
        }
        article.username = user.username
        article.avatar = user.avatar
        article.favorId = tecList[i]._id
        favorTechnology = favorTechnology.concat(article)
      }
      console.log('favorTechnology', favorTechnology);
      cache.setCache('favorTechnology', favorTechnology)
    }

    let myFavorList = []
    myFavorList.push(favorSuggestion)
    myFavorList.push(favorDemand)
    myFavorList.push(favorTechnology)

    this.setData({
      myFavorList: myFavorList,
      isLoad: true
    })
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getFavor()
  }
})