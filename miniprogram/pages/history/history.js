import {
  DBHistory
} from '../../db/DBHistory';
import {
  Cache
} from '../../db/Cache';

const dbHistory = new DBHistory()
const cache = new Cache()

let myData = {
  user: {}
}

Page({

  data: {
    articleImg: [],
    commentCount: 0,
    content: '',
    date: '',
    favorCount: 0,
    title: '',
    visitCount: 0,
    articleId: '',
    username: '',
    avatar: '',
    historyId: '',
    history: ''
  },

  onLoad: async function (options) {
    console.log(options.historyId)
    let article = cache.getCache(options.historyId)
    if (!article) {
      article = await dbHistory.getHistoryById(options.historyId)
      cache.setCache(options.historyId, article)
    }

    let user = cache.getCache(article.userId)
    if (!user) {
      user = await dbUser.getUser(articleData.userId)
      cache.setCache(articleData.userId, user)
    }
    myData.user = user

    this.getHistory(article, user, options.historyId)
  },

  getHistory(article, user, historyId) {
    this.setData({
      articleImg: article.articleImg,
      commentCount: article.commentCount,
      content: article.content,
      date: article.date,
      favorCount: article.favorCount,
      title: article.title,
      visitCount: article.visitCount,
      articleId: article.articleId,
      username: user.username,
      avatar: user.avatar,
      historyId: historyId
    })
    dbHistory.getHistory(this.data.articleId).then(res => {
      this.setData({
        history: res
      })
    })
  },

  onTapToHistory: async function (e) {
    let historyId = e.currentTarget.dataset.historyId
    let article = cache.getCache(historyId)
    if (!article) {
      article = await dbHistory.getHistoryById(historyId)
      cache.setCache(historyId, article)
    }
    this.getHistory(article, myData.user, historyId)
  }
})