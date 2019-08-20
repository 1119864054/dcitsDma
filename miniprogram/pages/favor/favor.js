import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();
const app = getApp();
var sliderWidth = 96;
var myData = {
  favorSuggestion: [],
  favorDemand: [],
  favorTechnology: []
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["需求意见箱", "业务需求", "项目需求"],
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
    let favorSuggestion = dbArticle.getCache('favorSuggestion')
    let favorDemand = dbArticle.getCache('favorDemand')
    let favorTechnology = dbArticle.getCache('favorTechnology')
    if (!favorSuggestion) {
      favorSuggestion = []
    }
    if (!favorDemand) {
      favorDemand = []
    }
    if (!favorTechnology) {
      favorTechnology = []
    }
    this.setData({
      favorSuggestion: favorSuggestion,
      favorDemand: favorDemand,
      favorTechnology: favorTechnology
    })
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

  async getFavorSuggestion() {
    myData.favorSuggestion = []
    let res1 = await dbArticle.getFavor(app.globalData.suggestionKey)
    for (let i = 0; i < res1.length; i++) {
      let article = dbArticle.getCache(res1[i].articleId)
      if (article) {
        myData.favorSuggestion = myData.favorSuggestion.concat(article)
      } else {
        await dbArticle.getArticleByAIdFromDB(res1[i].articleId, app.globalData.suggestionKey).then(res2 => {
          myData.favorSuggestion = myData.favorSuggestion.concat(res2)
          dbArticle.setCache(res1[i].articleId, res2[0])
        })
      }
    }
    console.log('myData.favorSuggestion', myData.favorSuggestion);
    dbArticle.setCache('favorSuggestion', myData.favorSuggestion)
    this.setData({
      favorSuggestion: myData.favorSuggestion
    })
  },

  async getFavorDemand() {
    myData.favorDemand = []
    let res1 = await dbArticle.getFavor(app.globalData.demandKey)
    for (let i = 0; i < res1.length; i++) {
      let article = dbArticle.getCache(res1[i].articleId)
      if (article) {
        myData.favorDemand = myData.favorDemand.concat(article)
      } else {
        await dbArticle.getArticleByAIdFromDB(res1[i].articleId, app.globalData.demandKey).then(res2 => {
          myData.favorDemand = myData.favorDemand.concat(res2)
          dbArticle.setCache(res1[i].articleId, res2[0])
        })
      }
    }
    console.log('myData.favorDemand', myData.favorDemand);
    dbArticle.setCache('favorDemand', myData.favorDemand)
    this.setData({
      favorDemand: myData.favorDemand
    })
  },

  async getFavorTechnology() {
    myData.favorTechnology = []
    let res1 = await dbArticle.getFavor(app.globalData.technologyKey)
    for (let i = 0; i < res1.length; i++) {
      let article = dbArticle.getCache(res1[i].articleId)
      if (article) {
        myData.favorTechnology = myData.favorTechnology.concat(article)
      } else {
        await dbArticle.getArticleByAIdFromDB(res1[i].articleId, app.globalData.technologyKey).then(res2 => {
          myData.favorTechnology = myData.favorTechnology.concat(res2)
          dbArticle.setCache(res1[i].articleId, res2[0])
        })
      }
    }
    console.log('myData.favorTechnology', myData.favorTechnology);
    dbArticle.setCache('favorTechnology', myData.favorTechnology)
    this.setData({
      favorTechnology: myData.favorTechnology
    })
  },

  onPullDownRefresh: function () {
    this.getFavorSuggestion();
    this.getFavorDemand();
    this.getFavorTechnology();
    wx.stopPullDownRefresh()
  }
})