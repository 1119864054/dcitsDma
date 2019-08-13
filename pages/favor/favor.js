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
    tabs: ["意见箱", "需求版", "技术天地"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    favorSuggestion: [],
    favorDemand: [],
    favorTechnology: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFavorSuggestion();
    this.getFavorDemand();
    this.getFavorTechnology();
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
    //     favorSuggestion:[]
    //   })
    //   this.getFavorSuggestion();
    // }
    // else if (this.data.activeIndex == 1) {
    //   this.setData({
    //     favorDemand:[]
    //   })
    //   this.getFavorDemand();
    // }
    // else {
    //   this.setData({
    //     favorTechnology:[]
    //   })
    //   this.getFavorTechnology();
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

  getFavorSuggestion: function (e) {
    var favor = wx.getStorageSync('userInfo')[0].favor;
    var suggestions = dbArticle.getAllArticleData(app.globalData.suggestionKey)
    for (var i = 0; i < favor.length; i++) {
      for (var j = 0; j < suggestions.length; j++) {
        if (favor[i] == suggestions[j]._id) {
          this.setData({
            favorSuggestion: this.data.favorSuggestion.concat(suggestions[j])
          })
        }
      }
    }
    console.log('favorSuggestion', this.data.favorSuggestion)
  },

  getFavorDemand: function (e) {
    var favor = wx.getStorageSync('userInfo')[0].favor;
    var demands = dbArticle.getAllArticleData(app.globalData.demandKey)
    for (var i = 0; i < favor.length; i++) {
      for (var j = 0; j < demands.length; j++) {
        if (favor[i] == demands[j]._id) {
          this.setData({
            favorDemand: this.data.favorDemand.concat(demands[j])
          })
        }
      }
    }
    console.log('favorDemand', this.data.favorDemand)
  },

  getFavorTechnology: function (e) {
    var favor = wx.getStorageSync('userInfo')[0].favor;
    var technologys = dbArticle.getAllArticleData(app.globalData.technologyKey)
    for (var i = 0; i < favor.length; i++) {
      for (var j = 0; j < technologys.length; j++) {
        if (favor[i] == technologys[j]._id) {
          this.setData({
            favorTechnology: this.data.favorTechnology.concat(technologys[j])
          })
        }
      }
    }
    console.log('favorTechnology', this.data.favorTechnology)
  },

  onPullDownRefresh: function () {
    if (this.data.activeIndex == 0) {
      this.setData({
        favorSuggestion:[]
      })
      this.getFavorSuggestion();
    }
    else if (this.data.activeIndex == 1) {
      this.setData({
        favorDemand:[]
      })
      this.getFavorDemand();
    }
    else {
      this.setData({
        favorTechnology:[]
      })
      this.getFavorTechnology();
    }
    wx.stopPullDownRefresh()
  }
})