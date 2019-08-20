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

    this.getFavor()

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

  async getFavor() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });

    let favorSuggestion = []
    let sugList = await dbArticle.getFavor(app.globalData.suggestionKey)
    for (let i = 0; i < sugList.length; i++) {
      let article = dbArticle.getCache(sugList[i].articleId)
      if (article) {
        favorSuggestion = favorSuggestion.concat(article)
      } else {
        await dbArticle.getArticleByAIdFromDB(sugList[i].articleId, app.globalData.suggestionKey).then(res2 => {
          favorSuggestion = favorSuggestion.concat(res2)
          dbArticle.setCache(sugList[i].articleId, res2[0])
        })
      }
    }
    console.log('favorSuggestion', favorSuggestion);
    dbArticle.setCache('favorSuggestion', favorSuggestion)

    let favorDemand = []
    let demList = await dbArticle.getFavor(app.globalData.demandKey)
    for (let i = 0; i < demList.length; i++) {
      let article = dbArticle.getCache(demList[i].articleId)
      if (article) {
        favorDemand = favorDemand.concat(article)
      } else {
        await dbArticle.getArticleByAIdFromDB(demList[i].articleId, app.globalData.demandKey).then(res2 => {
          favorDemand = favorDemand.concat(res2)
          dbArticle.setCache(demList[i].articleId, res2[0])
        })
      }
    }
    console.log('favorDemand', favorDemand);
    dbArticle.setCache('favorDemand', favorDemand)

    let favorTechnology = []
    let techList = await dbArticle.getFavor(app.globalData.technologyKey)
    for (let i = 0; i < techList.length; i++) {
      let article = dbArticle.getCache(techList[i].articleId)
      if (article) {
        favorTechnology = favorTechnology.concat(article)
      } else {
        await dbArticle.getArticleByAIdFromDB(techList[i].articleId, app.globalData.technologyKey).then(res2 => {
          favorTechnology = favorTechnology.concat(res2)
          dbArticle.setCache(techList[i].articleId, res2[0])
        })
      }
    }
    console.log('favorTechnology', favorTechnology);
    dbArticle.setCache('favorTechnology', favorTechnology)

    this.setData({
      favorSuggestion: favorSuggestion,
      favorDemand: favorDemand,
      favorTechnology: favorTechnology
    })

    wx.hideLoading();
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getFavor()
  }
})