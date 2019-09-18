import {
  DBArticle
} from "../../db/DBArticle";
import {
  DBUser
} from "../../db/DBUser";
import {
  Cache
} from "../../db/Cache";

const dbArticle = new DBArticle();
const dbUser = new DBUser();
const cache = new Cache()
const app = getApp()

import config from '../../util/config.js'

let pageSize = config.getPageSize
let currentPage = 0

let timer1 = 0
let timer2 = 0

const myData = {
  articleType: '',
  articleIdList: [],
}

Page({

  data: {
    articleList: [],
    loadMore: true,
    search: '',
    isSearch: false
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

  async onTapChange(e) {
    myData.articleIdList = e.detail.value
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
      articleIdList: prevPage.data.articleIdList.concat(myData.articleIdList)
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
      articleList
    })
  },

  loadMore: function () {
    let that = this
    if (this.data.isSearch) {
      timer1 = setTimeout(function () {
        that.searchMoreData(this.data.search)
      }, 600)
    } else {
      timer2 = setTimeout(function () {
        that.getMoreData()
      }, 600)
    }

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
        articleList
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

  onTapToSearch(e) {
    let search = e.detail.value
    if (search) {
      this.setData({
        isSearch: true,
        search: search
      })
      this.searchNewData(search)
    }
  },

  onTapToCancel(e) {
    this.setData({
      search: '',
      isSearch: false
    })
    this.getNewData()
  },

  async searchNewData(key) {
    currentPage = 1
    let articleList = await dbArticle.searchArticle(myData.articleType, key)
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
      articleList
    })
  },

  async searchMoreData(key) {
    console.log('currentPage', currentPage)

    this.setData({
      loadMore: true,
    })

    let that = this;
    let articleList = this.data.articleList

    let newArticleList = await dbArticle.searchArticle(myData.articleType, key, pageSize, currentPage)
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
        articleList
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

  onHide() {
    clearTimeout(timer1)
    clearTimeout(timer2)
  }
})