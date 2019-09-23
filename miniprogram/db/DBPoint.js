const db = wx.cloud.database()
const app = getApp()

import {
    Util
} from '../util/util';
const _ = db.command

const log = require('../util/log.js')

class DBPoint {
    constructor() {

    }

    //添加积分记录
    addPoint(userId, detail, point, articleId, title, articleType) {
        let util = new Util()
        return new Promise((resolve, reject) => {
            db.collection('point').add({
                data: {
                    detail: detail,
                    userId: userId,
                    point: point,
                    date: util.formatTime(new Date()),
                    articleId: articleId,
                    title: title,
                    articleType: articleType
                }
            }).then(res => {
                console.log('[DBPoint] [添加point] 成功: ', res)
                log.info('[DBPoint] [添加point] 成功: ', res)
                //更新积分
                wx.cloud.callFunction({
                    name: 'updatePoint',
                    data: {
                        userId: userId,
                        point: point
                    }
                }).then(res => {
                    console.log('[DBUser] [更新积分] 成功: ', res)
                    log.info('[DBUser] [更新积分] 成功: ', res)
                    resolve()
                }).catch(err => {
                    console.error('[DBUser] [更新积分] 失败: ', err)
                    log.error('[DBUser] [更新积分] 失败: ', err)
                    reject()
                })
                resolve()
            }).catch(err => {
                console.error('[DBPoint] [添加point] 失败: ', err)
                log.error('[DBPoint] [添加point] 失败: ', err)
                reject()
            })
        })
    }

    //获取积分明细
    getPoint(userId) {
        return new Promise((resolve, reject) => {
            db.collection('point').where({
                    userId: userId
                })
                .orderBy('date', 'desc')
                .get()
                .then(res => {
                    console.log('[DBPoint] [查询point] 成功: ', res.data)
                    log.info('[DBPoint] [查询point] 成功: ', res.data)
                    resolve(res.data)
                })
                .catch(err => {
                    console.error('[DBPoint] [查询point] 失败: ', err)
                    log.error('[DBPoint] [查询point] 失败: ', err)
                    reject()
                })
        })
    }
}

export {
    DBPoint
}