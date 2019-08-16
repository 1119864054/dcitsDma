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
    articleType: ''
  },

  onLoad: function (options) {
    this.setData({
      articleId: options.articleId,
      articleType: options.articleType,
    })
  },

  onTapToSubmit: function () {
    if (this.data.content.length > 0) {
      dbArticle.addComment(this.data.articleId, this.data.content, this.data.articleType).then(() => {
        wx.navigateBack({
          delta: 1
        });
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '不能提交空的评论！',
      });
    }
  },

  getContent: function (e) {
    this.setData({
      content: e.detail.value,
      current: e.detail.value.length
    })
  },

})