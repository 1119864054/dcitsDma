import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";
import { Cache } from '../../db/Cache';
import { DBMessage } from '../../db/DBMessage';
import { DBRelation } from '../../db/DBRelation';

var dbArticle = new DBArticle();
var dbUser = new DBUser();
var cache = new Cache()
var dbMessage = new DBMessage()
var dbRelation = new DBRelation()

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: [],
    isLoad: false,
    empty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let message = cache.getCache('message')
    this.setData({
      message: message
    })
    this.getMessage()
  },

  async getMessage() {
    this.setData({
      isLoad: false
    })

    let res1 = await dbMessage.getMessage()
    let message = res1.data
    if (message.length > 0) {
      for (let i = 0; i < message.length; i++) {
        let res2 = await dbRelation.getRelationById(message[i].relationId, message[i].relationType)
        let relation = res2.data[0]
        console.log('relation', relation)
        if (!relation) {
          dbMessage.removeMessageByRId(message[i].relationId)
        } else {
          if (message[i].relationType == 'SDRelation') {
            let demand = cache.getCache(relation.demandId)
            if (!demand) {
              let res3 = await dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand')
              if (res3) {
                demand = res3[0]
                cache.setCache(relation.demandId, demand)
              }
            }
            console.log('demand', demand)

            message[i].article = demand.title
            message[i].articleId = demand._id
            message[i].articleType = 'demand'

            let user = cache.getCache(message[i].relate)
            if (!user) {
              let res4 = await dbUser.getUser(message[i].relate)
              if (res4) {
                user = res4
                cache.setCache(message[i].relate, user)
              }
            }
            console.log('user', user)

            message[i].username = user.username
            message[i].avatar = user.avatar

            let suggestion = cache.getCache(relation.suggestionId)
            if (!suggestion) {
              let res5 = await dbArticle.getArticleByAIdFromDB(relation.suggestionId, 'suggestion')
              if (res5) {
                suggestion = res5[0]
                cache.setCache(relation.suggestionId, suggestion)
              }
            }

            console.log('suggestion', suggestion)
            message[i].myArticle = suggestion.title
            message[i].myArticleId = suggestion._id
            message[i].myArticleType = 'suggestion'
            console.log('message[i]', message[i])

          } else if (message[i].relationType == 'DTRelation') {

            let technology = cache.getCache(relation.technologyId)
            if (!technology) {
              let res3 = await dbArticle.getArticleByAIdFromDB(relation.technologyId, 'technology')
              if (res3) {
                technology = res3[0]
                cache.setCache(relation.technologyId, technology)
              }
            }
            console.log('technology', technology)

            message[i].article = technology.title
            message[i].articleId = technology._id
            message[i].articleType = 'technology'

            let user = cache.getCache(message[i].relate)
            if (!user) {
              let res4 = await dbUser.getUser(message[i].relate)
              if (res4) {
                user = res4
                cache.setCache(message[i].relate, user)
              }
            }
            console.log('user', user)

            message[i].username = user.username
            message[i].avatar = user.avatar

            let demand = cache.getCache(relation.demandId)
            if (!demand) {
              let res5 = await dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand')
              if (res5) {
                demand = res5[0]
                cache.setCache(relation.demandId, demand)
              }
            }
            console.log('demand', demand)

            message[i].myArticle = demand.title
            message[i].myArticleId = demand._id
            message[i].myArticleType = 'demand'
            console.log('message[i]', message[i])
          }
        }
      }
      console.log('message-after', message);
      cache.setCache('message', message)
      this.setData({
        message: message,
        isLoad: true
      })
    } else {
      this.setData({
        empty: true,
        isLoad: true
      })
    }
  },

  onTapCheck: function (e) {
    let messageId = e.currentTarget.dataset.messageId
    let message = this.data.message
    for (let i = 0; i < message.length; i++) {
      if (message[i]._id == messageId) {
        message[i].checked = true
        dbMessage.checkMessage(messageId)
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
    if (cache.getCache(articleId)) {
      wx.navigateTo({
        url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
      });
    } else {
      dbArticle.getArticleByAIdFromDB(articleId, articleType).then(res => {
        if (res) {
          cache.setCache(articleId, res[0])
        }
        wx.navigateTo({
          url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
        });
      })
    }
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getMessage()
  },
})