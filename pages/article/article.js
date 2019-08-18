// pages/article/article.js
import {
  Util
} from '../../util/util.js';

import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();
var util = new Util();

var myData = [];

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

    let articleImg = dbArticle.getCache(articleId + '_image_cache')
    if (!articleImg || !articleImg.length) {
      articleImg = articleData.articleImg
      util.getImageCached(articleId, articleData.articleImg)
    }

    let articleTypeZh = util.getArticleTypeZh(articleType)
    console.log('articleTypeZh', articleTypeZh)

    dbArticle.getUser(articleData.userId).then(res => {
      this.setData({
        author: res.username,
        avatar: res.avatar,
        content: articleData.content,
        articleImg: articleImg,
        date: articleData.date,
        title: articleData.title,
        articleTypeZh: articleTypeZh,
        articleType: articleType,
      })
    })
    myData.articleId = articleId;
    myData.articleType = articleType;

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
      url: '/pages/comment/comment?articleId=' + myData.articleId + '&articleType=' + myData.articleType
    });
  },

  onTapToRelate: function (event) {
    wx.navigateTo({
      url: '/pages/relation/relation?articleId=' + myData.articleId + '&articleType=' + myData.articleType
    });
  },

  onTapFavor: function (e) {
    dbArticle.isFavor(myData.articleId).then(res => {
      if (res) {
        wx.showToast({
          title: '已收藏',
          icon: 'none',
        });
      } else {
        dbArticle.addFavor(myData.articleId, myData.articleType)
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
    dbArticle.isFavor(myData.articleId).then(res => {
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