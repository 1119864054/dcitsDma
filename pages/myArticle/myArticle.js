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
    tabs: ["我的意见", "我的需求", "我的技术"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    mySuggestion: [],
    myDemand: [],
    myTechnology: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMySuggestion();
    this.getMyDemand();
    this.getMyTechnology();
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

  getMySuggestion: function (e) {
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.suggestionKey).then(res => {
      this.setData({
        mySuggestion: res
      })
    })
    console.log('mySuggestion', this.data.mySuggestion)
  },

  getMyDemand: function (e) {
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.demandKey).then(res => {
      this.setData({
        myDemand: res
      })
    })
    console.log('myDemand', this.data.myDemand)
  },

  getMyTechnology: function (e) {
    dbArticle.getArticleByIdFromDB(app.globalData.id, app.globalData.technologyKey).then(res => {
      this.setData({
        myTechnology: res
      })
    })
    console.log('myTechnology', this.data.myTechnology)
  },

  onPullDownRefresh: function () {
    if (this.data.activeIndex == 0) {
      this.setData({
        mySuggestion: []
      })
      this.getMySuggestion();
    }
    else if (this.data.activeIndex == 1) {
      this.setData({
        myDemand: []
      })
      this.getMyDemand();
    }
    else {
      this.setData({
        myTechnology: []
      })
      this.getMyTechnology();
    }
    wx.stopPullDownRefresh()
  }
})