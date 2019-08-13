import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

const app = getApp();

Page({

  data: {
    articleId: '',
    content: '',
    comment: [],
    value: '',
    current: 0
  },

  onLoad: function (options) {
    this.setData({
      articleId: options.articleId
    })
    this.refresh()
  },


  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  onTapToSubmit: function () {
    dbArticle.addComment(this.data.articleId, this.data.content).then(()=>{
      this.refresh()
    })
  },

  getContent: function (e) {
    this.setData({
      content: e.detail.value,
      current: e.detail.value.length
    })
  },

  refresh: function () {
    dbArticle.getComment(this.data.articleId).then(res => {
      this.setData({
        comment: res.data,
        current: 0,
        value: ''
      })
    })
  }
})