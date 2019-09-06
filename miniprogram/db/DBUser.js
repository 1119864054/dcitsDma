const db = wx.cloud.database()
const _ = db.command
const app = getApp()

import { Util } from '../util/util.js';

const log = require('../util/log.js')

class DBUser {
    constructor() {

    }

    //添加用户
    addUser() {
        let util = new Util()
        let openid = app.globalData.openid;
        let username = app.globalData.username;
        let avatar = app.globalData.avatar;

        return new Promise((resolve, reject) => {
            this.getUserByOpenid(openid).then(res => {
                if (!res) {
                    db.collection('user').add({
                        data: {
                            username: username,
                            avatar: avatar,
                            date: util.formatTime(new Date())
                        }
                    }).then(res => {
                        console.log('[DBUser] [未查询到用户->添加用户] 成功', res)
                        log.info('[DBUser] [未查询到用户->添加用户] 成功', res)
                        app.globalData.id = res._id
                        resolve()
                    }).catch(err => {
                        console.error('[DBUser] [未查询到用户->添加用户] 失败：', err)
                        log.error('[DBUser] [未查询到用户->添加用户] 失败：', err)
                        reject()
                    })
                } else {
                    resolve()
                }
            }).catch(err => {
                console.error('[DBUser] [查询用户] 失败：', err)
                log.error('[DBUser] [查询用户] 失败：', err)
                reject()
            })
        })
    }

    //更新用户
    updateUser() {
        let username = app.globalData.username;
        let avatar = app.globalData.avatar;

        return new Promise((resolve, reject) => {
            db.collection('user').doc(app.globalData.id)
                .update({
                    data: {
                        username: username,
                        avatar: avatar,
                    }
                }).then(res => {
                    console.log('[DBUser] [更新用户] 成功: ', res)
                    log.info('[DBUser] [更新用户] 成功: ', res)
                    resolve()
                }).catch(err => {
                    console.error('[DBUser] [更新用户] 失败: ', err)
                    log.error('[DBUser] [更新用户] 失败: ', err)
                    reject()
                })
        })
    }

    //获取用户信息
    getUser(id = app.globalData.id) {
        return new Promise((resolve, reject) => {
            db.collection('user').where({
                _id: id
            }).get().then(res => {
                console.log('[DBUser] [查询用户] 成功: ', res.data[0])
                log.info('[DBUser] [查询用户] 成功: ', res.data[0])
                resolve(res.data[0])
            }).catch(err => {
                console.error('[DBUser] [查询用户] 失败: ', err)
                log.error('[DBUser] [查询用户] 失败: ', err)
                reject()
            })
        })
    }

    //根据openid获取用户信息
    getUserByOpenid(openid) {
        return new Promise((resolve, reject) => {
            db.collection('user').where({
                _openid: openid
            }).get().then(res => {
                if (res.data[0]) {
                    console.log('[DBUser] [查询用户ByOpenid] 成功: ', res.data[0])
                    log.info('[DBUser] [查询用户ByOpenid] 成功: ', res.data[0])
                    app.globalData.id = res.data[0]._id
                }
                resolve(res.data[0])
            }).catch(err => {
                console.error('[DBUser] [查询用户ByOpenid] 失败: ', err)
                log.error('[DBUser] [查询用户ByOpenid] 失败: ', err)
                reject()
            })
        })
    }
}



export {
    DBUser
}