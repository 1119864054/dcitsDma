const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';
const _ = db.command

class DBComment {
    constructor() {

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
                    timeStamp: new Date().getTime(),
                    likeCount: 0
                }
            }).then(res => {
                console.log('[DBComment] [添加comment] 成功: ', res)
                resolve()
            }).catch(err => {
                console.error('[DBComment] [添加comment] 失败: ', err)
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
                .orderBy('likeCount', 'desc')
                .orderBy('date', 'desc')
                .get().then(res => {
                    console.log('[DBComment] [查询comment] 成功: ', res.data)
                    resolve(res.data)
                }).catch(err => {
                    console.error('[DBComment] [查询comment] 失败: ', err)
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
                    console.log('[DBComment] [查询mycomment] 成功: ', res.data)
                    resolve(res.data)
                }).catch(err => {
                    console.error('[DBComment] [查询mycomment] 失败: ', err)
                    reject()
                })
        })
    }

    //根据文章id获取评论数
    getCommentCountByAId(articleId) {
        return new Promise((resolve, reject) => {
            db.collection('comment').where({
                articleId: articleId
            }).count().then(res => {
                console.log('[DBComment] [获取评论数量] 成功: ', res.total)
                resolve(res.total)
            }).catch(err => {
                console.error('[DBComment] [获取评论数量] 失败: ', err)
                reject()
            })
        })
    }

    //更新点赞数
    updateLikeCount(commentId, likeCount) {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'updateLikeCount',
                data: {
                    commentId: commentId,
                    likeCount: likeCount
                }
            }).then(res => {
                console.log('[DBComment] [更新点赞数] 成功: ', res.result.stats)
                resolve()
            }).catch(err => {
                console.error('[DBComment] [更新点赞数] 失败: ', err)
                reject()
            })
        })
    }
}

export {
    DBComment
}