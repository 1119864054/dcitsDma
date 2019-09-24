import {
  DBArticle
} from '../../db/DBArticle';
import {
  Cache
} from '../../db/Cache';
import {
  DBComment
} from '../../db/DBComment';

const dbArticle = new DBArticle();
const cache = new Cache()
const dbComment = new DBComment()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myComment: [],
    isLoad: false,
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myComment = cache.getCache('myComment')
    this.setData({
      myComment: myComment
    })

    this.getMyComment()
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getMyComment()
  },

  onTapToArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    if (!cache.getCache(articleId)) {
      dbArticle.getArticleByAIdFromDB(articleId, articleType).then(res => {
        cache.setCache(articleId, res)
      })
    }
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  async getMyComment() {
    this.setData({
      isLoad: false
    })

    let myComment = []

    let commentList = await dbComment.getMyComment()
    if (commentList.length > 0) {
      let headAId = commentList[0].articleId
      let headAType = commentList[0].articleType
      let article = cache.getCache(headAId)
      if (!article) {
        article = (await dbArticle.getArticleByAIdFromDB(headAId, headAType))
      }
      let headATitle = article.title
      let headARemoved = article.removed
      let temp = {}
      let partMyComment = []

      for (let i = 0; i < commentList.length; i++) {
        let nowAId = commentList[i].articleId
        let nowAType = commentList[i].articleType
        if (nowAId != headAId) {
          temp.articleId = headAId
          temp.articleType = headAType
          temp.title = headATitle
          temp.removed = headARemoved
          temp.partMyComment = partMyComment

          myComment.push(temp)

          article = cache.getCache(nowAId)
          if (!article) {
            article = await dbArticle.getArticleByAIdFromDB(nowAId, nowAType)
          }

          headAId = article._id
          headAType = article.articleType
          headATitle = article.title
          headARemoved = article.removed
          partMyComment = []
          temp = {}
        }
        partMyComment.push(commentList[i])
      }
      if (partMyComment) {
        temp.articleId = headAId
        temp.articleType = headAType
        temp.title = headATitle
        temp.removed = headARemoved
        temp.partMyComment = partMyComment
        myComment.push(temp)
      }

      console.log('myComment', myComment)

      this.setData({
        myComment: myComment,
        isLoad: true
      })
      cache.setCache('myComment', myComment)
    } else {
      this.setData({
        empty: true,
        isLoad: true
      })
    }
  }
})