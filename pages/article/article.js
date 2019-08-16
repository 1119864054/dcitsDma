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
    let articleId = options.articleId
    let articleType = options.articleType

    let articleData = dbArticle.getArticleByIdFromCache(articleId, articleType)

    let articleTypeZh = util.getArticleTypeZh(articleType)
    console.log('articleTypeZh', articleTypeZh)

    dbArticle.getUser(this.data.userId).then(res => {
      this.setData({
        author: res.username,
        avatar: res.avatar,
      })
    })

    this.setData({
      content: articleData.content,
      articleImg: articleData.articleImg,
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
      url: '/pages/comment/comment?articleId=' + this.data.articleId
    });
  },

  onTapToRelate: function (event) {
    wx.navigateTo({
      url: '/pages/relation/relation?articleId=' + this.data.articleId + '&articleType=' + this.data.articleType
    });
  },

  onTapFavor: function (e) {
    dbArticle.isFavor(this.data.articleId).then(res => {
      if (res) {
        wx.showToast({
          title: '已收藏',
          icon: 'none',
        });
      } else {
        dbArticle.addFavor(this.data.articleId, this.data.articleType)
        this.setData({
          isFavor: 1,
          isFavorTxt: '已收藏'
        })
      }
    })
  },

  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh: function (e) {
    dbArticle.isFavor(this.data.articleId).then(res => {
      if (res) {
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
    })
  }
})