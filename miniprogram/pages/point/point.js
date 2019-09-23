import {
  DBArticle
} from '../../db/DBArticle';
import {
  Cache
} from "../../db/Cache";
import {
  DBPoint
} from "../../db/DBPoint";
import {
  DBUser
} from "../../db/DBUser";

const cache = new Cache()
const dbArticle = new DBArticle();
const dbPoint = new DBPoint();
const dbUser = new DBUser();

const app = getApp()
Page({

  data: {
    pointDetail: [],
    point: 0,
  },

  onLoad: async function (options) {
    let userId = app.globalData.id

    let user = await dbUser.getUser(userId)
    cache.setCache(userId, user)

    let pointDetail = await dbPoint.getPoint(userId)

    this.setData({
      point: user.point,
      pointDetail: pointDetail
    })
  },

  onTapToArticle(e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType

    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + "&articleType=" + articleType
    });

  }
})