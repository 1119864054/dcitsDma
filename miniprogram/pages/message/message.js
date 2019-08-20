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
    message: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let message = dbArticle.getCache('message')
    this.setData({
      message: message
    })
    wx.startPullDownRefresh()
    this.getMessage()
  },

  async getMessage() {
    let res1 = await dbArticle.getMessage()
    let message = res1.data
    console.log('message', message)

    for (let i = 0; i < message.length; i++) {

      let res2 = await dbArticle.getRelationById(message[i].relationId, message[i].relationType)
      let relation = res2.data[0]
      console.log('relation', relation)

      if (message[i].relationType == 'SDRelation') {
        let demand = dbArticle.getCache(relation.demandId)
        if (!demand) {
          let res3 = await dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand')
          demand = res3[0]
          dbArticle.setCache(relation.demandId, demand)
        }
        console.log('demand', demand)

        message[i].article = demand.title
        message[i].articleId = demand._id
        message[i].articleType = 'demand'

        let user = dbArticle.getCache(message[i].relate)
        if (!user) {
          let res4 = await dbArticle.getUser(message[i].relate)
          user = res4
          dbArticle.setCache(message[i].relate, user)
        }
        console.log('user', user)

        message[i].author = user.username

        let suggestion = dbArticle.getCache(relation.suggestionId)
        if (!suggestion) {
          let res5 = await dbArticle.getArticleByAIdFromDB(relation.suggestionId, 'suggestion')
          suggestion = res5[0]
          dbArticle.setCache(relation.suggestionId, suggestion)
        }

        console.log('suggestion', suggestion)
        message[i].myArticle = suggestion.title
        message[i].myArticleId = suggestion._id
        message[i].myArticleType = 'suggestion'
        console.log('message[i]', message[i])

      } else if (message[i].relationType == 'DTRelation') {

        let technology = dbArticle.getCache(relation.technologyId)
        if (!technology) {
          let res3 = await dbArticle.getArticleByAIdFromDB(relation.technologyId, 'technology')
          technology = res3[0]
          dbArticle.setCache(relation.technologyId, technology)
        }
        console.log('technology', technology)

        message[i].article = technology.title
        message[i].articleId = technology._id
        message[i].articleType = 'technology'

        let user = dbArticle.getCache(message[i].relate)
        if (!user) {
          let res4 = await dbArticle.getUser(message[i].relate)
          user = res4
          dbArticle.setCache(message[i].relate, user)
        }
        console.log('user', user)

        message[i].author = user.username

        let demand = dbArticle.getCache(relation.demandId)
        if (!demand) {
          let res5 = await dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand')
          demand = res5[0]
          dbArticle.setCache(relation.demandId, demand)
        }
        console.log('demand', demand)

        message[i].myArticle = demand.title
        message[i].myArticleId = demand._id
        message[i].myArticleType = 'demand'
        console.log('message[i]', message[i])
      }
    }
    console.log('message-after', message);
    dbArticle.setCache('message', message)
    this.setData({
      message: message
    })
    wx.stopPullDownRefresh()
  },

  onTapCheck: function (e) {
    let messageId = e.currentTarget.dataset.messageId
    let message = this.data.message
    for (let i = 0; i < message.length; i++) {
      if (message[i]._id == messageId) {
        message[i].checked = true
        dbArticle.checkMessage(messageId)
        break;
      }
    }
    this.setData({
      message: message
    })
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

  onPullDownRefresh: function () {
    this.getMessage()
  },
})