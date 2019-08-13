// pages/article/article.js
import {
  Util
} from '../../util/util.js';

import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();
var util = new Util();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFavor: '',
    isFavorTxt: '',

    author: '',
    articleImg: [],
    avatar: '',
    content: '',
    date: '',
    title: '',
    articleTypeZh: '',
    articleId: '',
    articleType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('article options', options)
    var articleId = options.articleId
    var articleType = options.articleType
    var articleData = dbArticle.getArticleByIdFromCache(articleId, articleType)
    console.log('articleData', articleData)
    var articleTypeZh = util.getArticleTypeZh(articleType)
    console.log('articleTypeZh', articleTypeZh)
    this.setData({
      author: articleData.author,
      articleImg: articleData.articleImg,
      avatar: articleData.avatar,
      content: articleData.content,
      date: articleData.date,
      title: articleData.title,
      articleTypeZh: articleTypeZh,
      articleId: articleId,
      articleType: articleType
    })

    this.refresh()
  },
  previewImage: function (e) {
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.articleImg // 需要预览的图片http链接列表
    })
  },

  onTapToComment: function (event) {
    wx.navigateTo({
      url: '/pages/comment/comment?articleId=' + this.data.articleId,
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });
  },

  onTapToRelate: function (event) {
    wx.navigateTo({
      url: '/pages/relation/relation?articleId=' + this.data.articleId + '&articleType=' + this.data.articleType,
      success: (result) => {

      },
      fail: () => { },
      complete: () => { }
    });
  },

  onTapFavor: function (e) {
    if (dbArticle.isFavor(this.data.articleId)) {
      wx.showToast({
        title: '已收藏',
        icon: 'none',
      });
    } else {
      dbArticle.addFavor(this.data.articleId)
      this.setData({
        isFavor: 1,
        isFavorTxt: '已收藏'
      })
    }
  },

  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh: function (e) {
    if (dbArticle.isFavor(this.data.articleId)) {
      this.setData({
        isFavor: 1,
        isFavorTxt: '已收藏'
      })
    } else {
      this.setData({
        isFavor: 0,
        isFavorTxt: '收藏'
      })
    }
  }
})