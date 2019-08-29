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

  //新增文章到数据库
  addNewArticle(storageKeyName, title, content, images, relation) {
    let id = app.globalData.id
    db.collection(storageKeyName).add({
      data: {
        date: util.formatTime(new Date()),
        title: title,
        userId: id,
        articleImg: images,
        content: content,
        timeStamp: new Date().getTime(),
        articleType: storageKeyName,
        removed: false
      }
    })
      .then(res => {
        //关联关系
        let relationType = ''
        if (storageKeyName == app.globalData.demandKey) {
          relationType = 'SDRelation'
        } else if (storageKeyName == app.globalData.technologyKey) {
          relationType = 'DTRelation'
        }
        for (let i = 0; i < relation.length; i++) {
          let idArray = relation[i].split('^^^')
          dbRelation.addRelation(relationType, idArray[0], res._id).then(relationId => {
            //消息
            dbMessage.addMessage(relationId, relationType, idArray[1], id)
          })
        }
        console.log('[DBArticle] [' + storageKeyName + '] [新增文章] 成功: _id=', res._id)
      })
      .catch(err => {
        wx.showToast({
          icon: 'none',
          title: '新增文章失败'
        })
        console.error('[DBArticle] [' + storageKeyName + '] [新增文章] 失败：', err)
      })
  }

  //根据用户ID从数据库读取文章
  getArticleByIdFromDB(userId, articleType) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).where({
        userId: userId,
        removed: false
      }).orderBy('date', 'desc')
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

  //删除文章
  removeArticle(articleId, articleType) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).doc(articleId).update({
        data: {
          removed: true
        }
      }).then(res => {
        console.log('[DBArticle] [删除article] 成功: ', res)
        cache.removeCache(articleId)
        resolve()
      }).catch(err => {
        console.error('[DBArticle] [删除article] 失败: ', err)
        reject()
      })
    })
  }
}

export {
  DBArticle
}