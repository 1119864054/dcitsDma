const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';

const log = require('../util/log.js')

class DBFavor {
    constructor() {

    }

    //是否收藏
    isFavor(articleId) {
        let userId = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('favor').where({
                articleId: articleId,
                userId: userId,
            }).get().then(res => {
                console.log('[DBFavor] [查询favor] 成功: ', res.data[0])
                log.info('[DBFavor] [查询favor] 成功: ', res.data[0])
                resolve(res.data[0])
            }).catch(err => {
                console.error('[DBFavor] [查询favor] 失败: ', err)
                log.error('[DBFavor] [查询favor] 失败: ', err)
                reject()
            })
        })
    }

    //取消收藏
    removeFavor(favorId) {
        return new Promise((resolve, reject) => {
            db.collection('favor').doc(favorId).remove().then(res => {
                console.log('[DBFavor] [删除favor] 成功: ', res)
                log.info('[DBFavor] [删除favor] 成功: ', res)
                resolve(res)
            }).catch(err => {
                console.error('[DBFavor] [删除favor] 失败: ', err)
                log.error('[DBFavor] [删除favor] 失败: ', err)
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
                console.log('[DBFavor] [添加favor] 成功: ', res)
                log.info('[DBFavor] [添加favor] 成功: ', res)
                resolve(res)
            }).catch(err => {
                console.error('[DBFavor] [添加favor] 失败: ', err)
                log.error('[DBFavor] [添加favor] 失败: ', err)
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
                    console.log('[DBFavor] [查询favor] 成功: ', res.data)
                    log.info('[DBFavor] [查询favor] 成功: ', res.data)
                    resolve(res.data)
                }).catch(err => {
                    console.error('[DBFavor] [查询favor] 失败: ', err)
                    log.error('[DBFavor] [查询favor] 失败: ', err)
                    reject()
                })
        })
    }

    //根据文章id获取收藏数
    getFavorCountByAId(articleId) {
        return new Promise((resolve, reject) => {
            db.collection('favor').where({
                articleId: articleId
            }).count().then(res => {
                console.log('[DBFavor] [获取收藏数量] 成功: ', res.total)
                log.info('[DBFavor] [获取收藏数量] 成功: ', res.total)
                resolve(res.total)
            }).catch(err => {
                console.error('[DBFavor] [获取收藏数量] 失败: ', err)
                log.error('[DBFavor] [获取收藏数量] 失败: ', err)
                reject()
            })
        })
    }

    //根据用户id获取收藏数
    getFavorCount() {
        let userId = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('favor').where({
                userId: userId
            }).count().then(res => {
                console.log('[DBFavor] [根据用户id获取收藏数] 成功: ', res.total)
                log.info('[DBFavor] [根据用户id获取收藏数] 成功: ', res.total)
                resolve(res.total)
            }).catch(err => {
                console.error('[DBFavor] [根据用户id获取收藏数] 失败: ', err)
                log.error('[DBFavor] [根据用户id获取收藏数] 失败: ', err)
                reject()
            })
        })
    }
}

export {
    DBFavor
}