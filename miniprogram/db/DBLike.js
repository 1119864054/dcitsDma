const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';

const log = require('../util/log.js')

class DBLike {
    constructor() {

    }

    //添加点赞关联
    addLike(commentId) {
        let util = new Util()
        let userId = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('like').add({
                data: {
                    commentId: commentId,
                    userId: userId,
                    date: util.formatTime(new Date()),
                }
            }).then(res => {
                console.log('[DBLike] [添加like] 成功: ', res._id)
                log.info('[DBLike] [添加like] 成功: ', res._id)
                resolve(res._id)
            }).catch(err => {
                console.error('[DBLike] [添加like] 失败: ', err)
                log.error('[DBLike] [添加like] 失败: ', err)
                reject()
            })
        })
    }

    //是否点赞
    isLiked(commentId) {
        let userId = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('like')
                .where({
                    commentId: commentId,
                    userId: userId
                })
                .get().then(res => {
                    console.log('[DBLike] [查询like] 成功: ', res.data[0])
                    log.info('[DBLike] [查询like] 成功: ', res.data[0])
                    resolve(res.data[0])
                }).catch(err => {
                    console.error('[DBLike] [查询like] 失败: ', err)
                    log.error('[DBLike] [查询like] 失败: ', err)
                    reject()
                })
        })
    }

    //取消点赞
    removeLike(likeId) {
        return new Promise((resolve, reject) => {
            db.collection('like').doc(likeId)
                .remove()
                .then(res => {
                    console.log('[DBLike] [删除like] 成功: ', res.stats)
                    log.info('[DBLike] [删除like] 成功: ', res.stats)
                    resolve()
                }).catch(err => {
                    console.error('[DBLike] [删除like] 失败: ', err)
                    log.error('[DBLike] [删除like] 失败: ', err)
                    reject()
                })
        })
    }
}

export {
    DBLike
}