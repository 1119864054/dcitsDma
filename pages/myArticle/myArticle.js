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
    // if (this.data.activeIndex == 0) {
    //   this.setData({
    //     mySuggestion:[]
    //   })
    //   this.getMySuggestion();
    // }
    // else if (this.data.activeIndex == 1) {
    //   this.setData({
    //     myDemand:[]
    //   })
    //   this.getMyDemand();
    // }
    // else {
    //   this.setData({
    //     myTechnology:[]
    //   })
    //   this.getMyTechnology();
    // }
  },

  onTapToArticle: function (event) {
    wx.navigateTo({
      url: '/pages/article/article',
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });
  },

  getMySuggestion: function (e) {
    var articleList = wx.getStorageSync('userInfo')[0].articleList;
    var suggestions = dbArticle.getAllArticleData(app.globalData.suggestionKey)
    for (var i = 0; i < articleList.length; i++) {
      for (var j = 0; j < suggestions.length; j++) {
        if (articleList[i] == suggestions[j]._id) {
          this.setData({
            mySuggestion: this.data.mySuggestion.concat(suggestions[j])
          })
        }
      }
    }
    console.log('mySuggestion', this.data.mySuggestion)
  },

  getMyDemand: function (e) {
    var articleList = wx.getStorageSync('userInfo')[0].articleList;
    var demands = dbArticle.getAllArticleData(app.globalData.demandKey)
    for (var i = 0; i < articleList.length; i++) {
      for (var j = 0; j < demands.length; j++) {
        if (articleList[i] == demands[j]._id) {
          this.setData({
            myDemand: this.data.myDemand.concat(demands[j])
          })
        }
      }
    }
    console.log('myDemand', this.data.myDemand)
  },

  getMyTechnology: function (e) {
    var articleList = wx.getStorageSync('userInfo')[0].articleList;
    var technologys = dbArticle.getAllArticleData(app.globalData.technologyKey)
    for (var i = 0; i < articleList.length; i++) {
      for (var j = 0; j < technologys.length; j++) {
        if (articleList[i] == technologys[j]._id) {
          this.setData({
            myTechnology: this.data.myTechnology.concat(technologys[j])
          })
        }
      }
    }
    console.log('myTechnology', this.data.myTechnology)
  },

  onPullDownRefresh: function () {
    if (this.data.activeIndex == 0) {
      this.setData({
        mySuggestion:[]
      })
      this.getMySuggestion();
    }
    else if (this.data.activeIndex == 1) {
      this.setData({
        myDemand:[]
      })
      this.getMyDemand();
    }
    else {
      this.setData({
        myTechnology:[]
      })
      this.getMyTechnology();
    }
    wx.stopPullDownRefresh()
  }
})