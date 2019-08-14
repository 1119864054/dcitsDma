import {
  Util
} from '../util/util.js';

const db = wx.cloud.database()
const _ = db.command
const app = getApp()

var util = new Util()

class DBArticle {
  constructor() {

  }

  //添加到缓存
  setCache(key, value) {
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
      console.log('[DBArticle] [' + storageKeyName + '] [查询缓存记录] 成功：', result)
      return result;
    } catch (err) {
      console.error('[DBArticle] [' + storageKeyName + '] [查询缓存记录] 失败：', err)
    }
  }

  //从数据库读取文章列表
  getAllArticleData(storageKeyName) {
    return new Promise((resolve, reject) => {
      db.collection(storageKeyName)
        .orderBy('date', 'desc')
        .get()
        .then(res => {
          let result = res.data
          console.log('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 成功: ', result)
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
        detail: content.length > 40 ? content.substring(0, 40).concat('...') : content,
        content: content
      }
    })
      .then(res => {
        //关联关系
        if (storageKeyName == app.globalData.demandKey) {
          for (let i = 0; i < relation.length; i++) {
            db.collection('SDRelation').add({
              data: {
                suggestionId: relation[i],
                demandId: res._id,
                date: util.formatTime(new Date()),
              }
            }).then(res => {
              console.log('[DBArticle] [新增sdrelation] 成功: ', res._id)
            }).catch(err => {
              console.error('[DBArticle] [新增sdrelation] 失败: ', err)
            })
          }
        } else if (storageKeyName == app.globalData.technologyKey) {
          for (let i = 0; i < relation.length; i++) {
            db.collection('DTRelation').add({
              data: {
                demandId: relation[i],
                technologyId: res._id,
                date: util.formatTime(new Date()),
              }
            }).then(res => {
              console.log('[DBArticle] [新增dtrelation] 成功: ', res._id)
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

  //根据文章ID从缓存读取文章
  getArticleByIdFromCache(articleId, articleType) {
    let articleData = this.getCache(articleType)
    for (let i = 0; i < articleData.length; i++) {
      if (articleData[i]._id == articleId) {
        console.log('[DBArticle] [根据文章ID查询缓存文章] 成功: ', articleData[i])
        return articleData[i]
      }
    }
  }

  //根据用户ID从数据库读取文章
  getArticleByIdFromDB(userId, articleType) {
    return new Promise((resolve, reject) => {
      db.collection(articleType).where({
        userId: userId
      }).orderBy('date', 'desc')
        .get().then(res => {
          console.log('[DBArticle] [根据userId查询article信息] 成功: ', res.data)
          resolve(res.data)
        }).catch(err=>{
          console.error('[DBArticle] [根据userId查询article信息] 失败: ', err)
          reject()
        })
    })

  }

  //添加用户
  addUser() {
    let openid = app.globalData.openid;
    let userInfo = app.globalData.userInfo;

    return new Promise((resolve, reject) => {
      db.collection('user').where({
        _openid: openid
      }).get().then(res => {
        console.log('[DBArticle] [根据openid查询user信息] 成功: ', res)
        if (!res.data.length || !res) {
          db.collection('user').add({
            data: {
              username: userInfo.nickName,
              avatar: userInfo.avatarUrl,
              date: util.formatTime(new Date()),
              sign: '个性签名'
            }
          }).then(res => {
            console.log('[DBArticle] [未查询到用户->添加用户] 成功', res)
            app.globalData.id = res._id
          }).catch(err => {
            console.error('[DBArticle] [未查询到用户->添加用户] 失败：', err)
            reject()
          })
        } else {
          app.globalData.id = res.data[0]._id
          console.log('[DBArticle] [查询用户] 成功', res.data[0])
          resolve()
        }
      }).catch(err => {
        console.error('[DBArticle] [查询用户] 失败：', err)
        reject()
      })
    })
  }

  //更新用户
  updateUser(sign = '个性签名') {
    let userInfo = app.globalData.userInfo;
    return new Promise((resolve, reject) => {
      db.collection('user').doc(app.globalData.id)
        .update({
          data: {
            username: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            sign: sign
          }
        }).then(res => {
          console.log('[DBArticle] [更新用户] 成功: ', res)
          resolve()
        }).catch(err => {
          console.error('[DBArticle] [更新用户] 失败: ', err)
          reject()
        })
    })
  }

  //获取用户信息
  getUser(id = app.globalData.id) {
    return new Promise((resolve, reject) => {
      db.collection('user').where({
        _id: id
      }).get().then(res => {
        console.log('[DBArticle] [查询用户] 成功: ', res.data[0])
        app.globalData.userInfoDB = res.data[0]
        resolve(res.data[0])
      }).catch(err => {
        console.error('[DBArticle] [查询用户] 失败: ', err)
        reject()
      })
    })
  }

  //我的收藏
  isFavor(articleId) {
    try {
      var res = wx.getStorageSync('userInfo')
      if (res) {
        console.log('[DBArticle] [userInfo] 查询成功: ', res)
        var favor = res[0].favor
        for (var i = 0; i < favor.length; i++) {
          if (articleId == favor[i]) {
            return true;
          }
        }
        return false;
      }
    } catch (err) {
      console.error('[DBArticle] [userInfo] 查询失败: ', err)
    }
  }

  //添加收藏
  addFavor(articleId) {
    db.collection('user').doc(app.globalData.id)
      .update({
        data: {
          favor: _.push([articleId])
        }
      }).then(res => {
        console.log('[DBArticle] [更新favor] 成功: ', res)
        db.collection('user').where({
          _id: app.globalData.id
        }).get().then(res => {
          wx.setStorageSync('userInfo', res.data)
          console.log('[DBArticle] [更新userInfo] 缓存成功: ', res)
        }).catch(err => {
          console.error('[DBArticle] [更新userInfo] 缓存失败: ', err)
        })
      }).catch(err => {
        console.error('[DBArticle] [更新favor] 失败: ', err)
      })
  }

  //添加评论
  addComment(articleId, content) {
    return new Promise((resolve, reject) => {
      var userInfo = app.globalData.userInfo
      db.collection('comment').add({
        data: {
          articleId: articleId,
          userId: app.globalData.id,
          username: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          content: content,
          date: util.formatTime(new Date()),
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
          userId: app.globalData.id
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
    return new Promise((resolve, reject) => {
      db.collection('comment')
        .where({
          userId: app.globalData.id
        })
        .orderBy('date', 'desc')
        .get().then(res => {
          console.log('[DBArticle] [查询mycomment] 成功: ', res)
          resolve(res)
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
      }
    })
  }
}



export {
  DBArticle
}