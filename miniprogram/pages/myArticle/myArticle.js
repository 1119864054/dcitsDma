import { DBArticle } from '../../db/DBArticle';
import { Cache } from '../../db/Cache';

var dbArticle = new DBArticle();
var cache = new Cache()

const app = getApp();

import config from '../../util/config.js'

let pageSize = config.getPageSize

let currentPage = 0
let articleType = ['suggestion', 'demand', 'technology']

var myData = {
  articleId: '',
  articleType: ''
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    suggestion: [],
    demand: [],
    technology: [],
    loadMore_suggestion: true,
    loadMore_demand: true,
    loadMore_technology: true,
    windowWidth: '',
    CustomBar: '',
    isLoad: false,
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let suggestion = [], demand = [], technology = []
    suggestion = cache.getCache('my_suggestion')
    demand = cache.getCache('my_demand')
    technology = cache.getCache('my_technology')
    this.setData({
      CustomBar: app.globalData.CustomBar,
      windowWidth: app.globalData.windowWidth,
      suggestion: suggestion,
      demand: demand,
      technology: technology
    })
  },

  onShow: function () {
    this.getMyArticle('suggestion')
    this.getMyArticle('demand')
    this.getMyArticle('technology')
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

  onTapEdit(e) {
    this.hideModal()
    wx.navigateTo({
      url: '/pages/editArticle/editArticle?articleId=' + myData.articleId + '&articleType=' + myData.articleType,
    });
  },

  async onTapDelete(e) {
    this.hideModal()
    wx.showLoading({
      title: '删除文章中',
      mask: true
    });
    await dbArticle.removeArticle(myData.articleId, myData.articleType).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        success: res => {
          this.getMyArticle(myData.articleType)
        }
      });
    })
  },

  showModal(e) {
    console.log('e.currentTarget.dataset.target', e.currentTarget.dataset.target)
    this.setData({
      modalName: e.currentTarget.dataset.target,
    })
    console.log('this.data.modalName', this.data.modalName)
    if (e.currentTarget.dataset.target == 'more') {
      this.setData({
        editTitle: e.currentTarget.dataset.editTitle
      })
      myData.articleId = e.currentTarget.dataset.articleId
      myData.articleType = e.currentTarget.dataset.articleType
    }
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  async getMyArticle(articleType) {
    this.setData({
      isLoad: false
    })
    let key = 'loadMore_' + [articleType]
    let myArticleType = 'my_' + articleType
    currentPage = 1

    let userId = app.globalData.id

    let myArticleList = await dbArticle.getArticleByIdFromDB(userId, articleType)
    cache.setCache(myArticleType, myArticleList)
    for (let i = 0; i < myArticleList.length; i++) {
      cache.setCache(myArticleList[i]._id, myArticleList[i])
    }
    if (myArticleList.length < pageSize) {
      this.setData({
        [key]: false
      })
    }
    this.setData({
      [articleType]: myArticleList,
      isLoad: true
    })
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getMyArticle(articleType[this.data.current])
  },

  loadMore: function () {
    let that = this
    setTimeout(function () {
      that.getMoreData(articleType[that.data.current])
    }, 600)
  },

  async getMoreData(articleType) {
    console.log('currentPage——————', currentPage)
    let key = 'loadMore_' + [articleType]
    this.setData({
      [key]: true,
    })

    let myArticleList = this.data[articleType]

    let newMyArticleList = await dbArticle.getArticleByIdFromDB(app.globalData.id, articleType, pageSize, currentPage)
    if (newMyArticleList && newMyArticleList.length > 0) {
      currentPage++;
      myArticleList = myArticleList.concat(newMyArticleList)
      this.setData({
        [articleType]: myArticleList
      })
      if (newMyArticleList.length < pageSize) {
        this.setData({
          [key]: false
        })
      }
      for (let i = 0; i < newMyArticleList.length; i++) {
        cache.setCache(newMyArticleList[i]._id, newMyArticleList[i])
      }
    } else {
      this.setData({
        [key]: false,
      });
    }
  },
})