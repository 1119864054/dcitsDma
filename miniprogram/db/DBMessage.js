const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';

const util = new Util()
const log = require('../util/log.js')

class DBMessage {
    constructor() {

    }

    //添加消息
    addMessage(relationId, relationType, beRelated, relate) {
        return new Promise((resolve, reject) => {
            db.collection('message').add({
                data: {
                    relationId: relationId,
                    relationType: relationType,
                    date: util.formatTime(new Date()),
                    checked: false,
                    beRelated: beRelated,
                    relate: relate,
                }
            }).then(res => {
                console.log('[DBMessage] [新增message] 成功: ', res._id)
                log.info('[DBMessage] [新增message] 成功: ', res._id)
                resolve()
            }).catch(err => {
                console.error('[DBMessage] [新增message] 失败: ', err)
                log.error('[DBMessage] [新增message] 失败: ', err)
                reject()
            })
        })
    }

    //获取关联消息
    getMessage() {
        let id = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('message').where({
                beRelated: id
            }).orderBy('checked', 'asc')
                .orderBy('date', 'desc')
                .get()
                .then(res => {
                    console.log('[DBMessage] [查询message] 成功: ', res)
                    log.info('[DBMessage] [查询message] 成功: ', res)
                    resolve(res)
                }).catch(err => {
                    console.error('[DBMessage] [查询message] 失败: ', err)
                    log.error('[DBMessage] [查询message] 失败: ', err)
                    reject()
                })
        })
    }

    //获取关联消息数
    getMessageCount() {
        let id = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('message').where({
                beRelated: id
            }).count().then(res => {
                console.log('[DBMessage] [查询MessageCount] 成功: ', res.total)
                log.info('[DBMessage] [查询MessageCount] 成功: ', res.total)
                resolve(res.total)
            }).catch(err => {
                console.error('[DBMessage] [查询MessageCount] 失败: ', err)
                log.error('[DBMessage] [查询MessageCount] 失败: ', err)
                reject()
            })
        })
    }

    //获取未读消息
    getUncheckedMessage() {
        let id = app.globalData.id
        return new Promise((resolve, reject) => {
            db.collection('message').where({
                beRelated: id,
                checked: false
            }).get()
                .then(res => {
                    console.log('[DBMessage] [查询未读message] 成功: ', res)
                    log.info('[DBMessage] [查询未读message] 成功: ', res)
                    resolve(res)
                }).catch(err => {
                    console.error('[DBMessage] [查询未读message] 失败: ', err)
                    log.error('[DBMessage] [查询未读message] 失败: ', err)
                    reject()
                })
        })
    }

    //消息已读
    checkMessage(messageId) {
        wx.cloud.callFunction({
            name: 'checkMessage',
            data: {
                messageId: messageId,
            }
        }).then(res => {
            console.log('[DBMessage] [更新message] 成功: ', res.result.stats)
            log.info('[DBMessage] [更新message] 成功: ', res.result.stats)
        }).catch(err => {
            console.error('[DBMessage] [更新message] 失败: ', err)
            log.error('[DBMessage] [更新message] 失败: ', err)
        })
    }

    //删除一篇文章的所有关联文章的消息
    removeMessageByRId(relationId) {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'removeMessage',
                data: {
                    relationId: relationId,
                }
            }).then(res => {
                console.log('[DBRelation] [删除关联消息] 成功: ', res.result)
                log.info('[DBRelation] [删除关联消息] 成功: ', res.result)
                resolve()
            }).catch(err => {
                console.error('[DBRelation] [删除关联消息] 失败: ', err)
                log.error('[DBRelation] [删除关联消息] 失败: ', err)
                reject()
            })
        })
    }
}


export {
    DBMessage
}