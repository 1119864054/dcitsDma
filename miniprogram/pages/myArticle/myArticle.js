import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();
const app = getApp();
var sliderWidth = 96;

var myData = {
  mySuggestion: [],
  myDemand: [],
  myTechnology: [],
}

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
    myData.mySuggestion = await dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.suggestionKey)
    console.log('myData.mySuggestion', myData.mySuggestion)
    dbArticle.setCache('mySuggestion', myData.mySuggestion)
    for (let i = 0; i < myData.mySuggestion.length; i++) {
      dbArticle.setCache(myData.mySuggestion[i]._id, myData.mySuggestion[i])
    }

    myData.myDemand = await dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.demandKey)
    console.log('myData.myDemand', myData.myDemand)
    dbArticle.setCache('myDemand', myData.myDemand)
    for (let i = 0; i < myData.myDemand.length; i++) {
      dbArticle.setCache(myData.myDemand[i]._id, myData.myDemand[i])
    }

    myData.myTechnology = await dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.technologyKey)
    console.log('myData.myTechnology', myData.myTechnology)
    dbArticle.setCache('myTechnology', myData.myTechnology)
    for (let i = 0; i < myData.myTechnology.length; i++) {
      dbArticle.setCache(myData.myTechnology[i]._id, myData.myTechnology[i])
    }

    this.setData({
      mySuggestion: myData.mySuggestion,
      myDemand: myData.myDemand,
      myTechnology: myData.myTechnology
    })
  },

  onPullDownRefresh: function () {
    this.getMyArticle()
    wx.stopPullDownRefresh()
  }
})