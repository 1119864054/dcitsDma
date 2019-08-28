import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myArticleList: [],
    windowHeight: '',
    CustomBar: '',
    isLoad: false,
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let mySuggestion = [],myDemand=[],myTechnology=[]
     mySuggestion = dbArticle.getCache('mySuggestion')
     myDemand = dbArticle.getCache('myDemand')
     myTechnology = dbArticle.getCache('myTechnology')
    let myArticleList = []
    myArticleList.push(mySuggestion)
    myArticleList.push(myDemand)
    myArticleList.push(myTechnology)
    this.setData({
      CustomBar: app.globalData.CustomBar,
      windowHeight: app.globalData.windowHeight,
      myArticleList: myArticleList
    })
    this.getMyArticle()
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

  async getMyArticle() {
    this.setData({
      isLoad: false
    })

    let mySuggestion = dbArticle.getCache('mySuggestion')
    if (!mySuggestion) {
      mySuggestion = await dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.suggestionKey)
      dbArticle.setCache('mySuggestion', mySuggestion)
    }
    for (let i = 0; i < mySuggestion.length; i++) {
      dbArticle.setCache(mySuggestion[i]._id, mySuggestion[i])
    }

    let myDemand = dbArticle.getCache('myDemand')
    if (!myDemand) {
      myDemand = await dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.demandKey)
      dbArticle.setCache('myDemand', myDemand)
    }
    for (let i = 0; i < myDemand.length; i++) {
      dbArticle.setCache(myDemand[i]._id, myDemand[i])
    }

    let myTechnology = dbArticle.getCache('myTechnology')
    if (!myTechnology) {
      myTechnology = await dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.technologyKey)
      dbArticle.setCache('myTechnology', myTechnology)
    }
    for (let i = 0; i < myTechnology.length; i++) {
      dbArticle.setCache(myTechnology[i]._id, myTechnology[i])
    }

    let myArticleList = []
    myArticleList.push(mySuggestion)
    myArticleList.push(myDemand)
    myArticleList.push(myTechnology)

    this.setData({
      myArticleList: myArticleList,
      isLoad: true
    })
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getMyArticle()
  }
})