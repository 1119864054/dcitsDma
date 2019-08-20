import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();
const app = getApp();
var sliderWidth = 96;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["我的意见", "业务需求", "项目需求"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    mySuggestion: [],
    myDemand: [],
    myTechnology: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let mySuggestion = dbArticle.getCache('mySuggestion')
    let myDemand = dbArticle.getCache('myDemand')
    let myTechnology = dbArticle.getCache('myTechnology')
    if (!mySuggestion) {
      mySuggestion = []
    }
    if (!myDemand) {
      myDemand = []
    }
    if (!myTechnology) {
      myTechnology = []
    }
    this.setData({
      mySuggestion: mySuggestion,
      myDemand: myDemand,
      myTechnology: myTechnology
    })

    this.getMyArticle()

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  onTapToArticle: function (event) {
    wx.navigateTo({
      url: '/pages/article/article'
    });
  },

  async getMyArticle() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });

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

    this.setData({
      mySuggestion: mySuggestion,
      myDemand: myDemand,
      myTechnology: myTechnology
    })

    wx.hideLoading();
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getMyArticle()
  }
})