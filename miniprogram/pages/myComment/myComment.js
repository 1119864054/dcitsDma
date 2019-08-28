import {
  DBArticle
} from '../../db/DBArticle.js';

var dbArticle = new DBArticle();

var myData = {
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myComment: [],
    isLoad: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myComment = dbArticle.getCache('myComment')
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

  async getMyComment() {
    this.setData({
      isLoad: false
    })

    let myComment = []

    let commentList = await dbArticle.getMyComment()

    let headAId = commentList[0].articleId
    let headAType = commentList[0].articleType
    let article = dbArticle.getCache(headAId)
    if (!article) {
      article = (await dbArticle.getArticleByAIdFromDB(headAId, headAType))[0]
    }
    let headATitle = article.title
    let temp = {}
    let partMyComment = []

    for (let i = 0; i < commentList.length; i++) {
      let nowAId = commentList[i].articleId
      let nowAType = commentList[i].articleType
      if (nowAId != headAId) {
        temp.articleId = headAId
        temp.articleType = headAType
        temp.title = headATitle
        temp.partMyComment = partMyComment

        myComment.push(temp)
        
        article = dbArticle.getCache(nowAId)
        if (!article) {
          article = (await dbArticle.getArticleByAIdFromDB(nowAId, nowAType))[0]
        }

        headAId = article._id
        headAType = article.articleType
        headATitle = article.title
        partMyComment = []
        temp = {}
      }
      partMyComment.push(commentList[i])
    }
    if (partMyComment) {
      temp.articleId = headAId
      temp.articleType = headAType
      temp.title = headATitle
      temp.partMyComment = partMyComment
      myComment.push(temp)
    }

    console.log('myComment', myComment)

    this.setData({
      myComment: myComment,
      isLoad: true
    })
    dbArticle.setCache('myComment', myComment)

    // let cgroup = myData.commentGroup
    // console.log(cgroup)
    // let myComment = []
    // for (let i = 0; i < cgroup.length; i++) {
    //   let comment = (await dbArticle.getMyComment(cgroup[i]._id)).data
    //   console.log(comment)
    //   let article = dbArticle.getCache(cgroup[i]._id)
    //   if (!article) {
    //     article = (await dbArticle.getArticleByAIdFromDB(cgroup[i]._id, comment[0].articleType))[0]
    //   }
    //   let temp = {}
    //   temp.comment = comment
    //   temp.articleId = article._id
    //   temp.articleType = article.articleType
    //   temp.title = article.title
    //   myComment.concat(temp)
    // }
    // console.log('myComment: ', myComment)

    // this.setData({
    //   myComment: myComment,
    //   isLoad: true
    // })
    // dbArticle.setCache('myComment', myComment)
  }
})