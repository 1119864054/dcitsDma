import {
  DBArticle
} from "../../db/DBArticle";
import {
  DBUser
} from "../../db/DBUser";
import {
  Cache
} from "../../db/Cache";

var dbArticle = new DBArticle();
var dbUser = new DBUser();
const cache = new Cache()
const app = getApp()

import config from '../../util/config.js'

let pageSize = config.getPageSize
let currentPage = 0

var myData = {
  articleType: '',
  value: [],
}

Page({

  data: {
    articleList: [],
    loadMore: true,
  },

  onLoad: function (options) {
    this.setData({
      CustomBar: app.globalData.CustomBar,
      windowWidth: app.globalData.windowWidth
    })
    if (options.articleType == 'demand') {
      myData.articleType = 'suggestion'
    } else if (options.articleType == 'technology') {
      myData.articleType = 'demand'
    }

    this.getNewData()
  },

  onTapChange(e) {
    myData.value = e.detail.value
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      detail: e.currentTarget.dataset.detail
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  submit() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      relation: myData.value
    })
    wx.navigateBack({
      delta: 1
    });
  },

  async getNewData() {
    currentPage = 1
    let articleList = await dbArticle.getAllArticleData(myData.articleType)
    for (let i = 0; i < articleList.length; i++) {
      let user = cache.getCache(articleList[i].userId)
      if (!user) {
        user = await dbUser.getUser(articleList[i].userId)
        cache.setCache(articleList[i].userId, user)
      }
      articleList[i].username = user.username
    }
    if (articleList.length < pageSize) {
      this.setData({
        loadMore: false
      })
    }
    this.setData({
      articleList: articleList,
    })
  },

  loadMore: function () {
    let that = this
    setTimeout(function () {
      that.getMoreData()
    }, 600)
  },

  async getMoreData() {
    console.log('currentPage', currentPage)

    this.setData({
      loadMore: true,
    })

    let that = this;
    let articleList = this.data.articleList

    let newArticleList = await dbArticle.getAllArticleData(myData.articleType, pageSize, currentPage)
    if (newArticleList && newArticleList.length > 0) {
      currentPage++;
      for (let i = 0; i < newArticleList.length; i++) {
        let user = cache.getCache(newArticleList[i].userId)
        if (!user) {
          user = await dbUser.getUser(newArticleList[i].userId)
          cache.setCache(newArticleList[i].userId, user)
        }
        newArticleList[i].username = user.username
      }
      articleList = articleList.concat(newArticleList)
      this.setData({
        articleList: articleList
      })
      if (newArticleList.length < pageSize) {
        this.setData({
          loadMore: false
        })
      }
    } else {
      that.setData({
        loadMore: false,
      });
    }
  },
})