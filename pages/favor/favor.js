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
  },

  onTapToArticle: function (event) {
    wx.navigateTo({
      url: '/pages/article/article'
    });
  },

  getFavorSuggestion: function (e) {
    dbArticle.getFavor(app.globalData.suggestionKey).then(res1=>{
      for(let i=0; i<res1.length;i++){
        dbArticle.getArticleByAIdFromDB(res1[i].articleId, app.globalData.suggestionKey).then(res2=>{
          this.setData({
            favorSuggestion:this.data.favorSuggestion.concat(res2)
          })
        })
      }
    })
  },

  getFavorDemand: function (e) {
    dbArticle.getFavor(app.globalData.demandKey).then(res1=>{
      for(let i=0; i<res1.length;i++){
        dbArticle.getArticleByAIdFromDB(res1[i].articleId, app.globalData.demandKey).then(res2=>{
          this.setData({
            favorDemand:this.data.favorDemand.concat(res2)
          })
        })
      }
    })
  },

  getFavorTechnology: function (e) {
    dbArticle.getFavor(app.globalData.technologyKey).then(res1=>{
      for(let i=0; i<res1.length;i++){
        dbArticle.getArticleByAIdFromDB(res1[i].articleId, app.globalData.technologyKey).then(res2=>{
          this.setData({
            favorTechnology:this.data.favorTechnology.concat(res2)
          })
        })
      }
    })
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