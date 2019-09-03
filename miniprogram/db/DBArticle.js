import { Util } from '../util/util';
import { DBRelation } from '../db/DBRelation';
import { DBMessage } from '../db/DBMessage';
import { Cache } from '../db/Cache';

const util = new Util()
const dbRelation = new DBRelation()
const dbMessage = new DBMessage()
const cache = new Cache()

import config from '../util/config.js'

const constPageSize = config.getPageSize

const db = wx.cloud.database()
const _ = db.command

const app = getApp()

class DBArticle {
  constructor() {

  }

  //从数据库读取文章列表
  getAllArticleData(storageKeyName, pageSize = constPageSize, currentPage = 0) {
    return new Promise((resolve, reject) => {
      db.collection(storageKeyName).where({
        removed: false
      })
        .orderBy('date', 'desc')
        .skip(currentPage * pageSize)
        .limit(pageSize)
        .get()
        .then(res => {
          let result = res.data
          if (result.length > 0) {
            console.log('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 成功: ', result)
          } else {
            console.log('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 未查询到记录', result)
          }
          resolve(result)
        })
        .catch(err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 失败：', err)
          reject()
        })
    })
  }

  //从数据库读取文章列表(不分页)
  getAllArticleDataUnlimited(storageKeyName) {
    return new Promise((resolve, reject) => {
      db.collection(storageKeyName).where({
        removed: false
      })
        .orderBy('date', 'desc')
        .get()
        .then(res => {
          let result = res.data
          if (result.length > 0) {
            console.log('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 成功: ', result)
          } else {
            console.log('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 未查询到记录', result)
          }
          resolve(result)
        })
        .catch(err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 失败：', err)
          reject()
        })
    })
  }

  //新增文章到数据库
  async addNewArticle(articleType, title, content, images, relation, updated = false) {
    let id = app.globalData.id
    try {
      let res = await db.collection(articleType).add({
        data: {
          date: util.formatTime(new Date()),
          title: title,
          userId: id,
          articleImg: images,
          content: content,
          timeStamp: new Date().getTime(),
          articleType: articleType,
          removed: false,
          updated: updated,

          favorCount: 0,
          commentCount: 0,
          visitCount: 0
        }
      })
      console.log('[DBArticle] [' + articleType + '] [新增文章] 成功: _id=', res._id)
      //关联关系
      let relationType = ''
      if (articleType == app.globalData.demandKey) {
        relationType = 'SDRelation'
      } else if (articleType == app.globalData.technologyKey) {
        relationType = 'DTRelation'
      }
      for (let i = 0; i < relation.length; i++) {
        let idArray = relation[i].split('^^^')
        let relationId = await dbRelation.addRelation(relationType, idArray[0], res._id)
        //消息
        await dbMessage.addMessage(relationId, relationType, idArray[1], id)
      }
      return res._id
    } catch (err) {
      wx.showToast({
        icon: 'none',
        title: '新增文章失败'
      })
      console.error('[DBArticle] [' + articleType + '] [新增文章] 失败：', err)
    }
  }

  //更新文章（编辑）
  async updateArticle(articleId, articleType, oldArticleType, title, content, images, relation) {
    // if (articleType != oldArticleType) {
    //   await dbRelation.removeRelationByAId(articleId, oldArticleType)
    //   await this.removeArticle(articleId, oldArticleType)
    //   await this.addNewArticle(articleType, title, content, images, relation, true)
    // } 
    cache.removeCache(articleId)
    let id = app.globalData.id
    let res = await db.collection(articleType).doc(articleId).update({
      data: {
        title: title,
        content: content,
        date: util.formatTime(new Date()),
        updated: true,
        articleImg: images
      }
    })
    await dbRelation.removeRelationByAId(articleId, articleType)
    //关联关系
    if (relation.length > 0) {
      let relationType = ''
      if (articleType == app.globalData.demandKey) {
        relationType = 'SDRelation'
      } else if (articleType == app.globalData.technologyKey) {
        relationType = 'DTRelation'
      }
      for (let i = 0; i < relation.length; i++) {
        let idArray = relation[i].split('^^^')
        let relationId = await dbRelation.addRelation(relationType, idArray[0], articleId)
        //消息
        await dbMessage.addMessage(relationId, relationType, idArray[1], id)
      }
      console.log('[DBArticle] [' + articleType + '] [更新文章] 返回信息: ', res)
    }
  }

  //更新文章（收藏）
  updateFavorCount(articleId, articleType, favorCount) {
    cache.removeCache(articleId)
    db.collection(articleType).doc(articleId).update({
      data: {
        favorCount: _.inc(favorCount)
      }
    }).then(res => {
      console.log('[DBArticle] [更新收藏数] 成功: ', res)
    }).catch(err => {
      console.error('[DBArticle] [更新收藏数] 失败: ', err)
    })
  }

  //更新文章（评论）
  updateCommentCount(articleId, articleType, commentCount) {
    cache.removeCache(articleId)
    db.collection(articleType).doc(articleId).update({
      data: {
        commentCount: _.inc(commentCount)
      }
    }).then(res => {
      console.log('[DBArticle] [更新评论数] 成功: ', res)
    }).catch(err => {
      console.error('[DBArticle] [更新评论数] 失败: ', err)
    })
  }

  //更新文章（访问）
  updateVisitCount(articleId, articleType, visitCount) {
    cache.removeCache(articleId)
    db.collection(articleType).doc(articleId).update({
      data: {
        visitCount: _.inc(visitCount)
      }
    }).then(res => {
      console.log('[DBArticle] [更新访问数] 成功: ', res)
    }).catch(err => {
      console.error('[DBArticle] [更新访问数] 失败: ', err)
    })
  }

  //根据用户ID从数据库读取文章
  getArticleByIdFromDB(userId, articleType, pageSize = constPageSize, currentPage = 0) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).where({
        userId: userId,
        removed: false
      }).orderBy('date', 'desc')
        .skip(currentPage * pageSize)
        .limit(pageSize)
        .get().then(res => {
          console.log('[DBArticle] [根据userId查询article信息] 成功: ', res.data)
          resolve(res.data)
        }).catch(err => {
          console.error('[DBArticle] [根据userId查询article信息] 失败: ', err)
          reject()
        })
    })
  }


  //根据文章ID从数据库读取文章
  getArticleByAIdFromDB(articleId, articleType) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).where({
        _id: articleId,
      }).get().then(res => {
        console.log('[DBArticle] [根据articleId查询article信息] 成功: ', res.data)
        resolve(res.data)
      }).catch(err => {
        console.error('[DBArticle] [根据articleId查询article信息] 失败: ', err)
        reject()
      })
    })
  }

  //根据用户id获取文章数
  getArticleCount() {
    let userId = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('suggestion').where({
        userId: userId
      }).count().then(res1 => {
        db.collection('demand').where({
          userId: userId
        }).count().then(res2 => {
          db.collection('technology').where({
            userId: userId
          }).count().then(res3 => {
            console.log('[DBArticle] [根据用户id获取文章数] 成功: ', res1.total, '+', res2.total, '+', res3.total)
            resolve(res1.total + res2.total + res3.total)
          })
        })
      }).catch(err => {
        console.error('[DBArticle] [根据用户id获取文章数] 失败: ', err)
        reject()
      })
    })
  }

  //删除文章（标记）
  removeArticle(articleId, articleType) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).doc(articleId).update({
        data: {
          removed: true
        }
      }).then(res => {
        console.log('[DBArticle] [删除article（标记）] 成功: ', res)
        cache.removeCache(articleId)
        resolve()
      }).catch(err => {
        console.error('[DBArticle] [删除article（标记）] 失败: ', err)
        reject()
      })
    })
  }

  //删除文章（真实）
  removeArticleReal(articleId, articleType) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).doc(articleId).remove().then(res => {
        console.log('[DBArticle] [删除article（真实）] 成功: ', res)
        cache.removeCache(articleId)
        resolve()
      }).catch(err => {
        console.error('[DBArticle] [删除article（真实）] 失败: ', err)
        reject()
      })
    })
  }

  //搜索文章
  searchArticle(articleType, key, pageSize = constPageSize, currentPage = 0) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).where({
        title: new db.RegExp({
          regexp: '[' + key + ']',
          options: 'i',
        })
      })
        .orderBy('date', 'desc')
        .skip(currentPage * pageSize)
        .limit(pageSize)
        .get().then(res => {
          console.log('[DBArticle] [search] 成功: ', res.data)
          resolve(res.data)
        }).catch(err => {
          console.error('[DBArticle] [search] 失败: ', err)
          reject(res)
        })
    })
  }
}

export {
  DBArticle
}