import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";

var dbArticle = new DBArticle();
var dbUser = new DBUser();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myFavorList: [],
    current: 0,
    windowHeight: '',
    CustomBar: '',
    isLoad: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let favorSuggestion = [], favorDemand = [], favorTechnology = []
    favorSuggestion = dbArticle.getCache('favorSuggestion')
    favorDemand = dbArticle.getCache('favorDemand')
    favorTechnology = dbArticle.getCache('favorTechnology')
    let myFavorList = []
    myFavorList.push(favorSuggestion)
    myFavorList.push(favorDemand)
    myFavorList.push(favorTechnology)
    console.log('myFavorList: ', myFavorList)
    this.setData({
      CustomBar: app.globalData.CustomBar,
      windowHeight: app.globalData.windowHeight,
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
    console.log(e)
    this.setData({
      current: e.detail.current
    })
  },

  onTapToArticle: function (e) {
    console.log(e);
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  onTapToUnfavor(e) {
    console.log('取消收藏')
  },

  async getFavor() {
    this.setData({
      isLoad: false
    })

    let favorSuggestion = []
    let sugList = await dbArticle.getFavor(app.globalData.suggestionKey)
    if (sugList) {
      for (let i = 0; i < sugList.length; i++) {
        let article = dbArticle.getCache(sugList[i].articleId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(sugList[i].articleId, app.globalData.suggestionKey))[0]
          dbArticle.setCache(sugList[i].articleId, article)
        }
        let user = dbArticle.getCache(article.userId)
        if(!user){
          user = await dbUser.getUser(article.userId)
          dbArticle.setCache(article.userId, user)
        }
        article.username = user.username
        article.avatar = user.avatar
        favorSuggestion = favorSuggestion.concat(article)
      }
      console.log('favorSuggestion', favorSuggestion);
      dbArticle.setCache('favorSuggestion', favorSuggestion)
    }

    let favorDemand = []
    let demList = await dbArticle.getFavor(app.globalData.demandKey)
    if (demList) {
      for (let i = 0; i < demList.length; i++) {
        let article = dbArticle.getCache(demList[i].articleId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(demList[i].articleId, app.globalData.demandKey))[0]
          dbArticle.setCache(demList[i].articleId, article)
        }
        let user = dbArticle.getCache(article.userId)
        if(!user){
          user = await dbUser.getUser(article.userId)
          dbArticle.setCache(article.userId, user)
        }
        article.username = user.username
        article.avatar = user.avatar
        favorDemand = favorDemand.concat(article)
      }
      console.log('favorDemand', favorDemand);
      dbArticle.setCache('favorDemand', favorDemand)
    }

    let favorTechnology = []
    let tecList = await dbArticle.getFavor(app.globalData.technologyKey)
    if (tecList) {
      for (let i = 0; i < tecList.length; i++) {
        let article = dbArticle.getCache(tecList[i].articleId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(tecList[i].articleId, app.globalData.technologyKey))[0]
          dbArticle.setCache(tecList[i].articleId, article)
        }
        let user = dbArticle.getCache(article.userId)
        if(!user){
          user = await dbUser.getUser(article.userId)
          dbArticle.setCache(article.userId, user)
        }
        article.username = user.username
        article.avatar = user.avatar
        favorTechnology = favorTechnology.concat(article)
      }
      console.log('favorTechnology', favorTechnology);
      dbArticle.setCache('favorTechnology', favorTechnology)
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