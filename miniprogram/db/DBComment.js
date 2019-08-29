const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';

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
                    timeStamp: new Date().getTime()
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
                .orderBy('date', 'desc')
                .get().then(res => {
                    console.log('[DBComment] [查询comment] 成功: ', res)
                    resolve(res)
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
}

export {
    DBComment
}