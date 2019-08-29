const db = wx.cloud.database()
const app = getApp()

import { Util } from '../util/util';

const util = new Util()

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
                resolve()
            }).catch(err => {
                console.error('[DBMessage] [新增message] 失败: ', err)
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
                    resolve(res)
                }).catch(err => {
                    console.error('[DBMessage] [查询message] 失败: ', err)
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
                    resolve(res)
                }).catch(err => {
                    console.error('[DBMessage] [查询未读message] 失败: ', err)
                    reject()
                })
        })
    }

    //消息已读
    checkMessage(messageId) {
        db.collection('message').doc(messageId).update({
            data: {
                checked: true
            }
        }).then(res => {
            console.log('[DBMessage] [更新message] 成功: ', res)
        }).catch(err => {
            console.error('[DBMessage] [更新message] 失败: ', err)
        })
    }
}


export {
    DBMessage
}