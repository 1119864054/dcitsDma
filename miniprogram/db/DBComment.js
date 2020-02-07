const db = wx.cloud.database()
const app = getApp()

import {
    Util
} from '../util/util';
const _ = db.command

const log = require('../util/log.js')

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
                    replyCount: 0
                }
            }).then(res => {
                console.log('[DBComment] [添加comment] 成功: ', res)
                log.info('[DBComment] [添加comment] 成功: ', res)
                resolve()
            }).catch(err => {
                console.error('[DBComment] [添加comment] 失败: ', err)
                log.error('[DBComment] [添加comment] 失败: ', err)
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
                    log.info('[DBComment] [查询comment] 成功: ', res.data)
                    resolve(res.data)
                }).catch(err => {
                    console.error('[DBComment] [查询comment] 失败: ', err)
                    log.error('[DBComment] [查询comment] 失败: ', err)
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
                    log.info('[DBComment] [查询mycomment] 成功: ', res.data)
                    resolve(res.data)
                }).catch(err => {
                    console.error('[DBComment] [查询mycomment] 失败: ', err)
                    log.error('[DBComment] [查询mycomment] 失败: ', err)
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
                log.info('[DBComment] [获取评论数量] 成功: ', res.total)
                resolve(res.total)
            }).catch(err => {
                console.error('[DBComment] [获取评论数量] 失败: ', err)
                log.error('[DBComment] [获取评论数量] 失败: ', err)
                reject()
            })
        })
    }

    //根据评论id获取评论
    getCommentCountById(commentId) {
        return new Promise((resolve, reject) => {
            db.collection('comment').where({
                _id: commentId
            }).get().then(res => {
                console.log('[DBComment] [根据评论id获取评论] 成功: ', res.data[0])
                log.info('[DBComment] [根据评论id获取评论] 成功: ', res.data._id)
                resolve(res.data[0])
            }).catch(err => {
                console.error('[DBComment] [根据评论id获取评论] 失败: ', err)
                log.error('[DBComment] [根据评论id获取评论] 失败: ', err)
                reject()
            })
        })
    }

    //更新评论（回复数）
    updateReplyCount(commentId, replyCount) {
        wx.cloud.callFunction({
            name: 'updateReplyCount',
            data: {
                commentId: commentId,
                replyCount: replyCount
            }
        }).then(res => {
            console.log('[DBArticle] [更新评论回复数] 成功: ', res)
            log.info('[DBArticle] [更新评论回复数] 成功: ', res)
        }).catch(err => {
            console.error('[DBArticle] [更新评论回复数] 失败: ', err)
            log.error('[DBArticle] [更新评论回复数] 失败: ', err)
        })
    }
}

export {
    DBComment
}