import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myComment: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myComment = dbArticle.getCache('myComment')
    this.setData({
      myComment: myComment
    })
    this.refresh()
  },

  onPullDownRefresh: function () {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  onTapToArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    if (dbArticle.getCache(articleId)) {
      wx.navigateTo({
        url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
      });
    } else {
      dbArticle.getArticleByAIdFromDB(articleId, articleType).then(res => {
        dbArticle.setCache(articleId, res[0])
        wx.navigateTo({
          url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
        });
      })
    }


  },

  async refresh() {
    let res = await dbArticle.getMyComment()
    let myComment = res.data
    for (let i = 0; i < myComment.length; i++) {
      let article = dbArticle.getCache(myComment[i].articleId)
      if (article) {
        myComment[i].title = article.title
      } else {
        await dbArticle.getArticleByAIdFromDB(myComment[i].articleId, myComment[i].articleType).then(res2 => {
          myComment[i].title = res2[0].title
          dbArticle.setCache(myComment[i].articleId, res2[0])
        })
      }
    }

    console.log('myComment', myComment);
    this.setData({
      myComment: myComment
    })
    dbArticle.setCache('myComment', myComment)
  }
})