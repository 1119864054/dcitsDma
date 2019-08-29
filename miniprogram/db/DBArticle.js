import { Util } from '../util/util.js';

import config from '../util/config.js'

const constPageSize = config.getPageSize

const db = wx.cloud.database()
const _ = db.command
const app = getApp()

// const util = new Util()

class DBArticle {
  constructor() {

  }

  //添加到缓存
  setCache(key, value) {
    // value.createTime = new Date().getTime()
    try {
      wx.setStorageSync(key, value)
      console.log('[DBArticle] [' + key + '] [同步缓存记录] 成功')
    } catch (err) {
      console.error('[DBArticle] [' + key + '] [同步缓存记录] 失败：', err)
    }
  }

  //从缓存读取数据
  getCache(storageKeyName) {
    try {
      let result = wx.getStorageSync(storageKeyName);
      if (!result || result.length < 1) {
        console.log('[DBArticle] [' + storageKeyName + '] [查询缓存记录] 未查询到记录', result)
      } else {
        console.log('[DBArticle] [' + storageKeyName + '] [查询缓存记录] 成功： ', result)
      }
      return result;
    } catch (err) {
      console.error('[DBArticle] [' + storageKeyName + '] [查询缓存记录] 失败：', err)
    }
  }

  //从缓存删除一条数据
  removeCache(storageKeyName) {
    try {
      let result = wx.removeStorageSync(storageKeyName)
      console.log('[DBArticle] [' + storageKeyName + '] [删除缓存' + storageKeyName + '] 成功： ', result)
    } catch (e) {
      console.log('[DBArticle] [' + storageKeyName + '] [删除缓存' + storageKeyName + '] 失败： ', e)
    }
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
    let util = new Util()
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
        if (storageKeyName == app.globalData.demandKey) {
          for (let i = 0; i < relation.length; i++) {
            let idArray = relation[i].split('^^^')
            db.collection('SDRelation').add({
              data: {
                suggestionId: idArray[0],
                demandId: res._id,
                date: util.formatTime(new Date()),
              }
            }).then(res => {
              console.log('[DBArticle] [新增sdrelation] 成功: ', res._id)
              db.collection('message').add({
                data: {
                  relationId: res._id,
                  relationType: 'SDRelation',
                  date: util.formatTime(new Date()),
                  checked: false,
                  beRelated: idArray[1],
                  relate: id,
                }
              }).then(res => {
                console.log('[DBArticle] [新增message] 成功: ', res._id)
              }).catch(err => {
                console.error('[DBArticle] [新增message] 失败: ', err)
              })
            }).catch(err => {
              console.error('[DBArticle] [新增sdrelation] 失败: ', err)
            })
          }
        } else if (storageKeyName == app.globalData.technologyKey) {
          for (let i = 0; i < relation.length; i++) {
            let idArray = relation[i].split('^^^')
            db.collection('DTRelation').add({
              data: {
                demandId: idArray[0],
                technologyId: res._id,
                date: util.formatTime(new Date()),
              }
            }).then(res => {
              console.log('[DBArticle] [新增dtrelation] 成功: ', res._id)
              db.collection('message').add({
                data: {
                  relationId: res._id,
                  relationType: 'DTRelation',
                  date: util.formatTime(new Date()),
                  checked: false,
                  beRelated: idArray[1],
                  relate: id,
                }
              }).then(res => {
                console.log('[DBArticle] [新增message] 成功: ', res._id)
              }).catch(err => {
                console.error('[DBArticle] [新增message] 失败: ', err)
              })
            }).catch(err => {
              console.error('[DBArticle] [新增dtrelation] 失败: ', err)
            })
          }
        }
        //缓存
        this.getAllArticleData(storageKeyName).then(res => {
          this.setCache(storageKeyName, res)
        })
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
    let that = this
    return new Promise((resolve, reject) => {
      db.collection(articleType).doc(articleId).update({
        data: {
          removed: true
        }
      }).then(res => {
        console.log('[DBArticle] [删除article] 成功: ', res)
        that.removeCache(articleId)
        resolve()
      }).catch(err => {
        console.error('[DBArticle] [删除article] 失败: ', err)
        reject()
      })
    })
  }

  //是否收藏
  isFavor(articleId) {
    let userId = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('favor').where({
        articleId: articleId,
        userId: userId,
      }).get().then(res => {
        console.log('[DBArticle] [查询favor] 成功: ', res.data[0])
        resolve(res.data[0])
      }).catch(err => {
        console.error('[DBArticle] [查询favor] 失败: ', err)
        reject()
      })
    })
  }

  //取消收藏
  removeFavor(favorId) {
    return new Promise((resolve, reject) => {
      db.collection('favor').doc(favorId).remove().then(res => {
        console.log('[DBArticle] [删除favor] 成功: ', res)
        resolve(res)
      }).catch(err => {
        console.error('[DBArticle] [删除favor] 失败: ', err)
        reject()
      })
    })
  }

  //添加收藏
  addFavor(articleId, articleType) {
    let util = new Util()
    let userId = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('favor').add({
        data: {
          articleId: articleId,
          userId: userId,
          date: util.formatTime(new Date()),
          articleType: articleType,
        }
      }).then(res => {
        console.log('[DBArticle] [添加favor] 成功: ', res)
        resolve(res)
      }).catch(err => {
        console.error('[DBArticle] [添加favor] 失败: ', err)
        reject()
      })
    })
  }

  //我的收藏
  getFavor(articleType) {
    let userId = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('favor').where({
        articleType: articleType,
        userId: userId
      }).orderBy('date', 'desc')
        .get().then(res => {
          console.log('[DBArticle] [查询favor] 成功: ', res)
          resolve(res.data)
        }).catch(err => {
          console.error('[DBArticle] [查询favor] 失败: ', err)
          reject()
        })
    })
  }

  //添加评论
  addComment(articleId, content, articleType) {
    let util = new Util()
    let userId = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('comment').add({
        data: {
          articleId: articleId,
          userId: userId,
          content: content,
          date: util.formatTime(new Date()),
          articleType: articleType,
          timeStamp: new Date().getTime()
        }
      }).then(res => {
        console.log('[DBArticle] [添加comment] 成功: ', res)
        resolve()
      }).catch(err => {
        console.error('[DBArticle] [添加comment] 失败: ', err)
        reject()
      })
    })
  }

  //获取评论
  getComment(articleId) {
    return new Promise((resolve, reject) => {
      db.collection('comment')
        .where({
          articleId: articleId,
        })
        .orderBy('date', 'desc')
        .get().then(res => {
          console.log('[DBArticle] [查询comment] 成功: ', res)
          resolve(res)
        }).catch(err => {
          console.error('[DBArticle] [查询comment] 失败: ', err)
          reject()
        })
    })
  }

  //获取我的评论
  getMyComment() {
    let userId = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('comment')
        .where({
          userId: userId
        })
        .orderBy('articleId', 'asc')
        .orderBy('date', 'desc')
        .get().then(res => {
          console.log('[DBArticle] [查询mycomment] 成功: ', res.data)
          resolve(res.data)
        }).catch(err => {
          console.error('[DBArticle] [查询mycomment] 失败: ', err)
          reject()
        })
    })
  }

  //获取关联关系
  getRelation(articleId, articleType) {
    return new Promise((resolve, reject) => {
      if (articleType == 'demand') {
        db.collection('SDRelation')
          .where({
            demandId: articleId
          })
          .orderBy('date', 'desc').get()
          .then(res => {
            console.log('[DBArticle] [查询SDRelation] 成功: ', res)
            resolve(res)
          }).catch(err => {
            console.error('[DBArticle] [查询SDRelation] 失败: ', err)
            reject()
          })
      } else if (articleType == 'technology') {
        db.collection('DTRelation')
          .where({
            technologyId: articleId
          })
          .orderBy('date', 'desc').get()
          .then(res => {
            console.log('[DBArticle] [查询DTRelation] 成功: ', res)
            resolve(res)
          }).catch(err => {
            console.error('[DBArticle] [查询DTRelation] 失败: ', err)
            reject()
          })
      } else {
        resolve()
      }
    })
  }

  //根据relationId获取关联关系
  getRelationById(relationId, relationType) {
    return new Promise((resolve, reject) => {
      db.collection(relationType)
        .where({
          _id: relationId
        }).get()
        .then(res => {
          console.log('[DBArticle] [查询' + relationType + '] 成功: ', res)
          resolve(res)
        }).catch(err => {
          console.error('[DBArticle] [查询' + relationType + '] 失败: ', err)
          reject()
        })
    })
  }

  //获取关联消息
  getMessage() {
    let id = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('message').where({
        beRelated: id
      }).orderBy('checked', 'asc')
        .orderBy('date', 'desc')
        .get()
        .then(res => {
          console.log('[DBArticle] [查询message] 成功: ', res)
          resolve(res)
        }).catch(err => {
          console.error('[DBArticle] [查询message] 失败: ', err)
          reject()
        })
    })
  }

  //获取未读消息
  getUncheckedMessage() {
    let id = app.globalData.id
    return new Promise((resolve, reject) => {
      db.collection('message').where({
        beRelated: id,
        checked: false
      }).get()
        .then(res => {
          console.log('[DBArticle] [查询未读message] 成功: ', res)
          resolve(res)
        }).catch(err => {
          console.error('[DBArticle] [查询未读message] 失败: ', err)
          reject()
        })
    })
  }

  //消息已读
  checkMessage(messageId) {
    db.collection('message').doc(messageId).update({
      data: {
        checked: true
      }
    }).then(res => {
      console.log('[DBArticle] [更新message] 成功: ', res)
    }).catch(err => {
      console.error('[DBArticle] [更新message] 失败: ', err)
    })
  }
}



export {
  DBArticle
}