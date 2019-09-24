import {
  DBArticle
} from "../../db/DBArticle";
import {
  DBUser
} from "../../db/DBUser";
import {
  Cache
} from '../../db/Cache';
import {
  DBMessage
} from '../../db/DBMessage';
import {
  DBRelation
} from '../../db/DBRelation';

const dbArticle = new DBArticle();
const dbUser = new DBUser();
const cache = new Cache()
const dbMessage = new DBMessage()
const dbRelation = new DBRelation()

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
    if (message) {
      this.setData({
        message: message
      })
    }
    this.getMessage()
  },

  async getMessage() {
    this.setData({
      isLoad: false
    })

    let message = await dbMessage.getMessage()

    if (message.length > 0) {
      for (let i = 0; i < message.length; i++) {
        let relation = await dbRelation.getRelationById(message[i].relationId)
        if (!relation) {
          // dbMessage.removeMessageByRId(message[i].relationId)
        } else {
          if (message[i].articleType == 'demand') {
            let demand = cache.getCache(relation.demandId)
            if (!demand) {
              demand = await dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand')
              cache.setCache(relation.demandId, demand)
            }

            message[i].article = demand.title
            message[i].articleId = demand._id
            message[i].articleType = 'demand'
            message[i].removed = demand.removed

            let user = cache.getCache(message[i].relate)
            if (!user) {
              user = await dbUser.getUser(message[i].relate)
              cache.setCache(message[i].relate, user)
            }

            message[i].username = user.username
            message[i].avatar = user.avatar

            let suggestion = cache.getCache(relation.suggestionId)
            if (!suggestion) {
              suggestion = await dbArticle.getArticleByAIdFromDB(relation.suggestionId, 'suggestion')
              cache.setCache(relation.suggestionId, suggestion)
            }
            message[i].myArticle = suggestion.title
            message[i].myArticleId = suggestion._id
            message[i].myArticleType = 'suggestion'
            message[i].myArticleRemoved = suggestion.removed

          } else if (message[i].articleType == 'technology') {

            let technology = cache.getCache(relation.technologyId)
            if (!technology) {
              technology = await dbArticle.getArticleByAIdFromDB(relation.technologyId, 'technology')
              cache.setCache(relation.technologyId, technology)
            }

            message[i].article = technology.title
            message[i].articleId = technology._id
            message[i].articleType = 'technology'
            message[i].removed = technology.removed

            let user = cache.getCache(message[i].relate)
            if (!user) {
              user = await dbUser.getUser(message[i].relate)
              cache.setCache(message[i].relate, user)
            }

            message[i].username = user.username
            message[i].avatar = user.avatar

            let demand = cache.getCache(relation.demandId)
            if (!demand) {
              demand = await dbArticle.getArticleByAIdFromDB(relation.demandId, 'demand')
              cache.setCache(relation.demandId, demand)
            }

            message[i].myArticle = demand.title
            message[i].myArticleId = demand._id
            message[i].myArticleType = 'demand'
            message[i].myArticleRemoved = demand.removed
          }
        }
      }
      console.log('message', message)
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
    if (!cache.getCache(articleId)) {
      dbArticle.getArticleByAIdFromDB(articleId, articleType).then(res => {
        cache.setCache(articleId, res)
      })
    }
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getMessage()
  },
})