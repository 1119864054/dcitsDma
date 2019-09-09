// pages/article/article.js
import { Util } from '../../util/util';
import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";
import { Cache } from '../../db/Cache';
import { DBFavor } from '../../db/DBFavor';
import { DBComment } from '../../db/DBComment';
import { DBRelation } from '../../db/DBRelation';
import { DBLike } from '../../db/DBLike';

var util = new Util();
var dbArticle = new DBArticle();
var dbUser = new DBUser();
var cache = new Cache()
var dbFavor = new DBFavor()
var dbComment = new DBComment()
var dbRelation = new DBRelation()
var dbLike = new DBLike()

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
    visitCount: 0,
    updated: false,

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
    let articleId = options.articleId
    let articleType = options.articleType
    myData.articleId = articleId;
    myData.articleType = articleType;

    let articleData = cache.getCache(articleId)

    if (articleData.removed) {
      this.setData({
        removed: articleData.removed
      })
    } else {
      let timeStamp = cache.getCache(articleId + '_timeStamp')
      if (!timeStamp) {
        cache.setCache(articleId + '_timeStamp', articleData.timeStamp)
      }
      let comment = cache.getCache(articleId + '_comment')

      let articleTypeZh = util.getArticleTypeZh(articleType)

      let articleImg = cache.getCache(articleId + '_image_cache')
      if (timeStamp != articleData.timeStamp || !articleImg) {
        cache.setCache(articleId + '_timeStamp', articleData.timeStamp)
        articleImg = articleData.articleImg
        cache.getImageCached(articleId, articleData.articleImg)
      }

      let res = cache.getCache(articleData.userId)
      if (res) {
        res = await dbUser.getUser(articleData.userId)
        cache.setCache(articleData.userId, res)
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
        myAvatar: app.globalData.avatar,
        favorCount: articleData.favorCount,
        visitCount: articleData.visitCount,
        updated: articleData.updated
      })

      dbFavor.isFavor(articleId).then(res => {
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

      if (!cache.getCache(articleId + '_visit')) {
        dbArticle.updateVisitCount(articleId, articleType, 1)
        cache.setCache(articleId + '_visit', true)
      }

      dbArticle.getArticleByAIdFromDB(articleId, articleType).then(res => {
        cache.setCache(articleId, res[0])
      })
    }
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  previewImage: function (e) {
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
        dbFavor.addFavor(myData.articleId, myData.articleType).then(res => {
          this.setData({
            favorId: res._id
          })
          dbArticle.updateFavorCount(myData.articleId, myData.articleType, 1)
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
    dbFavor.removeFavor(favorId)
    dbArticle.updateFavorCount(myData.articleId, myData.articleType, -1)
  },

  onTapToRelate(e) {
    let articleId = e.currentTarget.dataset.articleId
    let articleType = e.currentTarget.dataset.articleType
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId + '&articleType=' + articleType
    });
  },

  async getComment() {
    let comment = await dbComment.getComment(myData.articleId)
    if (comment && comment.length > 0) {
      for (let i = 0; i < comment.length; i++) {
        let isLiked = await dbLike.isLiked(comment[i]._id)
        if (isLiked.length > 0) {
          comment[i].isLiked = true
          comment[i].likeId = isLiked[0]._id
        } else {
          comment[i].isLiked = false
        }
        let userInfo = cache.getCache(comment[i].userId)
        if (userInfo) {
          comment[i].username = userInfo.username
          comment[i].avatar = userInfo.avatar
        } else {
          await dbUser.getUser(comment[i].userId).then(userInfo => {
            if (userInfo) {
              cache.setCache(comment[i].userId, userInfo)
              comment[i].username = userInfo.username
              comment[i].avatar = userInfo.avatar
            }
          })
        }
      }

      console.log('comment', comment);
      cache.setCache(myData.articleId + '_comment', comment)
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
        dbComment.addComment(myData.articleId, myData.commentContent, myData.articleType).then(() => {
          that.getComment()
          myData.commentContent = ''
          dbArticle.updateCommentCount(myData.articleId, myData.articleType, 1)
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

  reply(e) {
    let username = e.currentTarget.dataset.username
    this.setData({
      value: '回复 @' + username + ' : '
    })
  },

  like(e) {
    if (app.globalData.logged) {
      let comment = this.data.comment
      comment[e.currentTarget.dataset.idx].isLiked = true
      comment[e.currentTarget.dataset.idx].likeCount++
      this.setData({
        comment: comment
      })
      wx.showToast({
        title: '点赞成功',
        icon: 'none'
      });
      dbLike.addLike(e.currentTarget.dataset.commentId).then(likeId => {
        comment[e.currentTarget.dataset.idx].likeId = likeId
        this.setData({
          comment: comment
        })
      })
      dbComment.updateLikeCount(e.currentTarget.dataset.commentId, 1)
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
    }
  },

  cancelLike(e) {
    let comment = this.data.comment
    comment[e.currentTarget.dataset.idx].isLiked = false
    comment[e.currentTarget.dataset.idx].likeCount--
    this.setData({
      comment: comment
    })
    wx.showToast({
      title: '取消点赞',
      icon: 'none'
    });
    dbLike.removeLike(e.currentTarget.dataset.likeId)
    dbComment.updateLikeCount(e.currentTarget.dataset.commentId, -1)
  },

  getContent: function (e) {
    myData.commentContent = e.detail.value
  },

  async getRelation() {
    let relationDetail = []
    let res = await dbRelation.getRelation(myData.articleId, myData.articleType)
    if (res) {
      let relation = res.data

      if (myData.articleType == 'demand') {
        for (let i = 0; i < relation.length; i++) {
          let temp = {}
          let article = cache.getCache(relation[i].suggestionId)
          if (!article) {
            article = (await dbArticle.getArticleByAIdFromDB(relation[i].suggestionId, 'suggestion'))[0]
            cache.setCache(relation[i].suggestionId, article)
          }
          temp.title = article.title
          temp.articleId = article._id
          temp.articleType = article.articleType
          let user = cache.getCache(article.userId)
          if (!user) {
            user = await dbUser.getUser(article.userId)
            cache.setCache(article.userId, user)
          }
          temp.username = user.username
          relationDetail.push(temp)
        }
      }
      else if (myData.articleType == 'technology') {
        for (let i = 0; i < relation.length; i++) {
          let temp = {}
          let article = cache.getCache(relation[i].demandId)
          if (!article) {
            article = (await dbArticle.getArticleByAIdFromDB(relation[i].demandId, 'demand'))[0]
            cache.setCache(relation[i].demandId, article)
          }
          temp.title = article.title
          temp.articleId = article._id
          temp.articleType = article.articleType
          let user = cache.getCache(article.userId)
          if (!user) {
            user = await dbUser.getUser(article.userId)
            cache.setCache(article.userId, user)
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