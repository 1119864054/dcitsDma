// pages/article/article.js
import { Util } from '../../util/util.js';
import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";

var dbArticle = new DBArticle();
var dbUser = new DBUser();
var util = new Util();

var myData = {
  articleId: '',
  articleType: '',
  commentContent: ''
};
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    removed: false,

    isFavor: '',
    value: '',
    favorId: '',
    favorCount: 0,

    comment: [],
    relationDetail: [],
    username: '',
    articleImg: [],
    avatar: '',
    content: '',
    date: '',
    title: '',
    articleTypeZh: '',
    articleType: '',
    myAvatar: "/images/tabbar/user.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    console.log('article options', options)
    let articleId = options.articleId
    let articleType = options.articleType
    myData.articleId = articleId;
    myData.articleType = articleType;

    let articleData = dbArticle.getCache(articleId)

    console.log('articleData', articleData)

    this.setData({
      removed: articleData.removed
    })

    let comment = dbArticle.getCache(articleId + '_comment')

    let articleTypeZh = util.getArticleTypeZh(articleType)
    console.log('articleTypeZh', articleTypeZh)

    let articleImg = dbArticle.getCache(articleId + '_image_cache')
    if (!articleImg) {
      articleImg = articleData.articleImg
      util.getImageCached(articleId, articleData.articleImg)
    }

    let res = dbArticle.getCache(articleData.userId)
    if (res) {
      res = await dbUser.getUser(articleData.userId)
      dbArticle.setCache(articleData.userId, res)
    }
    let content = articleData.content.split("。")
    this.setData({
      comment: comment,
      username: res.username,
      avatar: res.avatar,
      content: content,
      articleImg: articleImg,
      date: articleData.date,
      title: articleData.title,
      articleTypeZh: articleTypeZh,
      articleType: articleType,
      myAvatar: app.globalData.avatar
    })

    dbArticle.isFavor(articleId).then(res => {
      let isFavor = false
      if (res) {
        isFavor = true
        this.setData({
          isFavor: isFavor,
          favorId: res._id
        })
      }
    })

    this.getComment()
    this.getRelation()
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
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
    if (app.globalData.logged) {
      if (!this.data.isFavor) {
        this.setData({
          isFavor: true,
          favorCount: this.data.favorCount + 1
        })
        dbArticle.addFavor(myData.articleId, myData.articleType).then(res => {
          this.setData({
            favorId: res._id
          })
          console.log('收藏成功：', res);
          wx.showToast({
            title: '收藏成功',
            icon: 'none',
          });
        })
      }
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      });
    }
  },

  onTapUnFavor(e) {
    this.setData({
      isFavor: false,
      favorCount: this.data.favorCount - 1
    })
    let favorId = e.currentTarget.dataset.favorId
    dbArticle.removeFavor(favorId)
  },

  onTapToRelate(e) {
    console.log(e);
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  async getComment() {
    let res1 = await dbArticle.getComment(myData.articleId)
    if (res1) {
      let comment = res1.data
      for (let i = 0; i < comment.length; i++) {
        let userInfo = dbArticle.getCache(comment[i].userId)
        if (userInfo) {
          comment[i].username = userInfo.username
          comment[i].avatar = userInfo.avatar
        } else {
          await dbUser.getUser(comment[i].userId).then(userInfo => {
            if (userInfo) {
              dbArticle.setCache(comment[i].userId, userInfo)
              comment[i].username = userInfo.username
              comment[i].avatar = userInfo.avatar
            }
          })
        }
      }

      console.log('comment', comment);
      dbArticle.setCache(myData.articleId + '_comment', comment)
      this.setData({
        comment: comment,
        value: ''
      })
    }
  },

  onTapToSubmit: function () {
    let that = this
    if (app.globalData.logged) {
      if (myData.commentContent.length > 0) {
        dbArticle.addComment(myData.articleId, myData.commentContent, myData.articleType).then(() => {
          that.getComment()
          myData.commentContent = ''
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '不能提交空的评论！',
        });
      }
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      });

    }

  },

  getContent: function (e) {
    myData.commentContent = e.detail.value
  },

  async getRelation() {
    let relationDetail = []
    let res = await dbArticle.getRelation(myData.articleId, myData.articleType)
    if (res) {
      let relation = res.data

      if (myData.articleType == 'demand') {
        for (let i = 0; i < relation.length; i++) {
          let temp = {}
          let article = dbArticle.getCache(relation[i].suggestionId)
          if (!article) {
            article = (await dbArticle.getArticleByAIdFromDB(relation[i].suggestionId, 'suggestion'))[0]
            dbArticle.setCache(relation[i].suggestionId, article)
          }
          temp.title = article.title
          temp.articleId = article._id
          temp.articleType = article.articleType
          let user = dbArticle.getCache(article.userId)
          if (!user) {
            user = await dbUser.getUser(article.userId)
            dbArticle.setCache(article.userId, user)
          }
          temp.username = user.username
          relationDetail.push(temp)
        }
      }
      else if (myData.articleType == 'technology') {
        for (let i = 0; i < relation.length; i++) {
          let temp = {}
          let article = dbArticle.getCache(relation[i].demandId)
          if (!article) {
            article = (await dbArticle.getArticleByAIdFromDB(relation[i].demandId, 'demand'))[0]
            dbArticle.setCache(relation[i].demandId, article)
          }
          temp.title = article.title
          temp.articleId = article._id
          temp.articleType = article.articleType
          let user = dbArticle.getCache(article.userId)
          if (!user) {
            user = await dbUser.getUser(article.userId)
            dbArticle.setCache(article.userId, user)
          }
          temp.username = user.username
          relationDetail.push(temp)
        }
      }
    }
    console.log('relationDetail: ', relationDetail);
    this.setData({
      relationDetail: relationDetail
    })
  }
})