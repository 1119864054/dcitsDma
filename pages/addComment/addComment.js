import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

const app = getApp();

Page({

  data: {
    content: '',
    value: '',
    current: 0,
    articleId: '',
  },

  onLoad: function (options) {
    this.setData({
      articleId: options.articleId
    })
  },

  onTapToSubmit: function () {
    dbArticle.addComment(this.data.articleId, this.data.content).then(() => {
      wx.navigateBack({
        delta: 1
      });
    })
  },

  getContent: function (e) {
    this.setData({
      content: e.detail.value,
      current: e.detail.value.length
    })
  },

})