const db = wx.cloud.database()
const _ = db.command
const app = getApp()

class DBArticle {
  constructor() {

  }

  getAllArticleData(storageKeyName) {
    console.log('storageKeyName', storageKeyName)
    try {
      var result = wx.getStorageSync(storageKeyName);
    } catch (error) {
      console.error('[DBArticle] [' + storageKeyName + '] [查询缓存记录] 失败：', err)
    }
    console.log('result', result.length, result)
    if (!result.length || !result) {
      db.collection(storageKeyName)
        .orderBy('date', 'desc')
        .get()
        .then(res => {
          result = res.data
          console.log('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 成功: ', result)
          wx.setStorageSync(storageKeyName, result)
        })
        .catch(err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[DBArticle] [' + storageKeyName + '] [查询数据库记录] 失败：', err)
        })
    }
    return result;
  }

  //新增文章
  addNewArticle(storageKeyName, title, content, username, images, avatar, relation) {
    db.collection(storageKeyName).add({
      data: {
        articleId: "",
        date: new Date().toLocaleString(),
        title: title,
        author: username,
        articleImg: images,
        avatar: avatar,
        detail: content.length > 40 ? content.substring(0, 40).concat('...') : content,
        content: content
      }
    })
      .then(res => {
        //关联关系
        if (storageKeyName == 'demand') {
          for (let i = 0; i < relation.length; i++) {
            db.collection('SDRelation').add({
              data: {
                suggestionId: relation[i],
                demandId: res._id,
                date: new Date().toLocaleString(),
              }
            }).then(res => {
              console.log('[DBArticle] [新增relation] 成功: ', res._id)
            }).catch(err => {
              console.error('[DBArticle] [新增relation] 失败: ', err)
            })
          }
        } else if (storageKeyName == 'technology') {
          for (let i = 0; i < relation.length; i++) {
            db.collection('DTRelation').add({
              data: {
                demandId: relation[i],
                technologyId: res._id,
                date: new Date().toLocaleString(),
              }
            }).then(res => {
              console.log('[DBArticle] [新增relation] 成功: ', res._id)
            }).catch(err => {
              console.error('[DBArticle] [新增relation] 失败: ', err)
            })
          }
        }
        //我的文章
        db.collection('user').doc(app.globalData.id)
          .update({
            data: {
              articleList: _.push([res._id])
            }
          }).then(res => {
            console.log('[DBArticle] [更新articleList] 成功: ', res)
            db.collection('user').where({
              _id: app.globalData.id
            }).get().then(res => {
              wx.setStorageSync('userInfo', res.data)
              console.log('[DBArticle] [更新userInfo] 缓存成功: ', res)
            }).catch(err => {
              console.error('[DBArticle] [更新userInfo] 缓存失败: ', err)
            })
          }).catch(err => {
            console.error('[DBArticle] [更新articleList] 失败: ', err)
          })
        //缓存
        db.collection(storageKeyName)
          .orderBy('date', 'desc')
          .get()
          .then(res => {
            wx.setStorageSync(storageKeyName, res.data)
            console.log('[DBArticle] [' + storageKeyName + '] [同步缓存] 成功: ', res.data)
          })
          .catch(err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[DBArticle] [' + storageKeyName + '] [查询记录] 失败：', err)
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
    try {
      var articleData = wx.getStorageSync(articleType)
      console.log('[DBArticle] [查询缓存文章] 成功: ', articleData)
      for (var i = 0; i < articleData.length; i++) {
        if (articleData[i]._id == articleId) {
          console.log('[DBArticle] [根据文章ID查询缓存文章] 成功: ', articleData[i])
          return articleData[i]
        }
      }
    } catch (err) {
      console.error('[DBArticle] [查询缓存文章] 失败：', err)
    }


  }

  //用户
  checkUserIsExistAndAddUser() {
    var openid = app.globalData.openid;
    var userInfo = app.globalData.userInfo;
    var result = wx.getStorageSync('userInfo');
    console.log('[DBArticle] [userInfo] [查询缓存]', result)
    if (!result) {
      return new Promise((resolve, reject) => {
        db.collection('user').where({
          _openid: openid
        }).get().then(res => {
          console.log('res---------------', res)
          if (!res.data.length) {
            db.collection('user').add({
              data: {
                username: userInfo.nickName,
                articleList: [],
                avatar: userInfo.avatarUrl,
                favor: [],
                comment: [],
                message: []
              }
            }).then(res => {
              console.log('[DBArticle] [未查询到用户->添加用户] 成功', res)
              db.collection('user').where({
                _id: res._id
              }).get().then(res => {
                app.globalData.id = res.data[0]._id
                wx.setStorageSync('userInfo', res.data);
                console.log('[DBArticle] [未查询到用户->添加用户->查询用户] 成功', res.data)
                resolve()
              }).catch(err => {
                console.error('[DBArticle] [未查询到用户->添加用户->查询用户] 失败：', err)
                reject()
              })
            }).catch(err => {
              console.error('[DBArticle] [未查询到用户->添加用户] 失败：', err)
              reject()
            })
          } else {
            app.globalData.id = res.data[0]._id
            wx.setStorageSync('userInfo', res.data);
            console.log('[DBArticle] [查询用户] 成功', res.data)
            resolve()
          }
        }).catch(err => {
          console.error('[DBArticle] [查询用户] 失败：', err)
          reject()
        })
      })
    } else {
      app.globalData.id = result[0]._id
    }
    return result;
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
          date: new Date().toLocaleString(),
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