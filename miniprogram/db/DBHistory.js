const db = wx.cloud.database()
const app = getApp()

import {
    Util
} from '../util/util';
const _ = db.command

const log = require('../util/log.js')

class DBHistory {
    constructor() {

    }

    //添加历史记录
    addHistory(article) {
        let util = new Util()
        return new Promise((resolve, reject) => {
            db.collection('history').add({
                data: {
                    articleImg: article.articleImg,
                    articleType: article.articleType,
                    commentCount: article.commentCount,
                    content: article.content,
                    date: article.date,
                    favorCount: article.favorCount,
                    title: article.title,
                    userId: article.userId,
                    visitCount: article.visitCount,
                    articleId: article._id,

                    history_date: util.formatTime(new Date()),
                }
            }).then(res => {
                console.log('[DBHistory] [添加history] 成功: ', res)
                log.info('[DBHistory] [添加history] 成功: ', res)
                resolve()
            }).catch(err => {
                console.error('[DBHistory] [添加history] 失败: ', err)
                log.error('[DBHistory] [添加history] 失败: ', err)
                reject()
            })
        })
    }

    //获取历史记录
    getHistory(articleId) {
        let that = this
        return new Promise((resolve, reject) => {
            db.collection('history').where({
                    articleId: articleId
                })
                .orderBy('date', 'asc')
                .get()
                .then(res => {
                    let historyList = res.data
                    console.log('[DBHistory] [查询history] 成功: ', historyList)
                    log.info('[DBHistory] [查询history] 成功: ', historyList)
                    while (historyList.length > 5) {
                        let history = historyList.splice(0, 1)[0]
                        console.log('history', history)
                        that.removeHistory(history._id)
                    }
                    resolve(historyList)
                })
                .catch(err => {
                    console.error('[DBHistory] [查询history] 失败: ', err)
                    log.error('[DBHistory] [查询history] 失败: ', err)
                    reject()
                })
        })
    }

    //根据HId获取历史记录
    getHistoryById(historyId) {
        return new Promise((resolve, reject) => {
            db.collection('history').where({
                    _id: historyId
                })
                .get()
                .then(res => {
                    console.log('[DBHistory] [根据HId查询history] 成功: ', res.data[0])
                    log.info('[DBHistory] [根据HId查询history] 成功: ', res.data[0])
                    resolve(res.data[0])
                })
                .catch(err => {
                    console.error('[DBHistory] [根据HId查询history] 失败: ', err)
                    log.error('[DBHistory] [根据HId查询history] 失败: ', err)
                    reject()
                })
        })
    }

    //删除历史记录
    removeHistory(historyId) {
        return new Promise((resolve, reject) => {
            db.collection('history')
                .doc(historyId)
                .remove()
                .then(res => {
                    console.log('[DBHistory] [删除历史记录] 成功: ', res)
                    log.info('[DBHistory] [删除历史记录] 成功: ', res)
                    resolve()
                })
                .catch(err => {
                    console.error('[DBHistory] [删除历史记录] 失败: ', err)
                    log.error('[DBHistory] [删除历史记录] 失败: ', err)
                    reject()
                })
        })
    }
}

export {
    DBHistory
}