import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMessage()
  },

  getMessage() {
    dbArticle.getMessage().then(res1 => {
      let message = res1.data
      console.log('message', message)
      for (let i = 0; i < message.length; i++) {
        dbArticle.getRelationById(message[i].relationId, message[i].relationType).then(res2 => {
          let relation = res2.data[0]
          console.log('relation', relation)
          if (message[i].relationType == 'SDRelation') {
            dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand').then(res3 => {
              let demand = res3[0]
              console.log('demand', demand)
              message[i].article = demand.title
              message[i].articleId = demand._id
              message[i].articleType = 'demand'
              dbArticle.getUser(message[i].relate).then(res4 => {
                let user = res4
                console.log('user', user)
                message[i].author = user.username
                dbArticle.getArticleByAIdFromDB(relation.suggestionId, 'suggestion').then(res5 => {
                  let suggestion = res5[0]
                  console.log('suggestion', suggestion)
                  message[i].myArticle = suggestion.title
                  message[i].myArticleId = suggestion._id
                  message[i].myArticleType = 'suggestion'
                  console.log('message[i]', message[i])
                  this.setData({
                    message: this.data.message.concat(message[i])
                  })
                })
              })
            })
          } else if (message[i].relationType == 'DTRelation') {
            dbArticle.getArticleByAIdFromDB(relation.technologyId, 'technology').then(res3 => {
              let technology = res3[0]
              console.log('technology', technology)
              message[i].article = technology.title
              message[i].articleId = technology._id
              message[i].articleType = 'technology'
              dbArticle.getUser(message[i].relate).then(res4 => {
                let user = res4
                console.log('user', user)
                message[i].author = user.username
                dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand').then(res5 => {
                  let demand = res5[0]
                  console.log('demand', demand)
                  message[i].myArticle = demand.title
                  message[i].myArticleId = demand._id
                  message[i].myArticleType = 'demand'
                  console.log('message[i]', message[i])
                  this.setData({
                    message: this.data.message.concat(message[i])
                  })
                })
              })
            })
          }
        })
      }
    })
  },

  onTapCheck: function (e) {
    let messageId = e.currentTarget.dataset.messageId
    let message = this.data.message
    for (let i = 0; i < message.length; i++) {
      if (message[i]._id == messageId) {
        message[i].checked = true
        this.setData({
          message: message
        })
        dbArticle.checkMessage(messageId)
      }
    }
  },

  onTapToArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  onTapToMyArticle: function (e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },
})