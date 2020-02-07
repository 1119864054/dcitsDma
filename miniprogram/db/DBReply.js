const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';
const _ = db.command

const log = require('../util/log.js')

class DBReply {
    constructor() {

    }

    //添加评论回复
    addReply(commentId, content) {
        let util = new Util()
        let userId = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('reply').add({
                data: {
                    commentId: commentId,
                    userId: userId,
                    content: content,
                    date: util.formatTime(new Date()),
                    timeStamp: new Date().getTime(),
                }
            }).then(res => {
                console.log('[DBReply] [添加Reply] 成功: ', res)
                log.info('[DBReply] [添加Reply] 成功: ', res)
                resolve()
            }).catch(err => {
                console.error('[DBReply] [添加Reply] 失败: ', err)
                log.error('[DBReply] [添加Reply] 失败: ', err)
                reject()
            })
        })
    }

    //获取评论回复
    getReply(commentId) {
        return new Promise((resolve, reject) => {
            db.collection('reply')
                .where({
                    commentId: commentId,
                })
                .orderBy('date', 'desc')
                .get().then(res => {
                    console.log('[DBReply] [查询Reply] 成功: ', res.data)
                    log.info('[DBReply] [查询Reply] 成功: ', res.data)
                    resolve(res.data)
                }).catch(err => {
                    console.error('[DBReply] [查询Reply] 失败: ', err)
                    log.error('[DBReply] [查询Reply] 失败: ', err)
                    reject()
                })
        })
    }
}

export {
    DBReply
}