const db = wx.cloud.database()

import { Util } from '../util/util';

const util = new Util()

const log = require('../util/log.js')

class DBRelation {
    constructor() {

    }

    //添加关联关系
    addRelation(relationType, firstId, secondId) {
        if (relationType == 'SDRelation') {
            return new Promise((resolve, reject) => {
                db.collection(relationType).add({
                    data: {
                        suggestionId: firstId,
                        demandId: secondId,
                        date: util.formatTime(new Date()),
                    }
                }).then(res => {
                    console.log('[DBRelation] [新增' + relationType + '] 成功: ', res._id)
                   log.info('[DBRelation] [新增' + relationType + '] 成功: ', res._id)
                    resolve(res._id)
                }).catch(err => {
                    console.error('[DBRelation] [新增' + relationType + '] 失败: ', err)
                    log.error('[DBRelation] [新增' + relationType + '] 失败: ', err)
                    reject()
                })
            })
        } else if (relationType == 'DTRelation') {
            return new Promise((resolve, reject) => {
                db.collection(relationType).add({
                    data: {
                        demandId: firstId,
                        technologyId: secondId,
                        date: util.formatTime(new Date()),
                    }
                }).then(res => {
                    console.log('[DBRelation] [新增' + relationType + '] 成功: ', res._id)
                    log.info('[DBRelation] [新增' + relationType + '] 成功: ', res._id)
                    resolve(res._id)
                }).catch(err => {
                    console.error('[DBRelation] [新增' + relationType + '] 失败: ', err)
                    log.error('[DBRelation] [新增' + relationType + '] 失败: ', err)
                    reject()
                })
            })
        }
    }

    //获取关联关系
    getRelation(articleId, articleType) {
        return new Promise((resolve, reject) => {
            if (articleType == 'demand') {
                db.collection('SDRelation')
                    .where({
                        demandId: articleId
                    })
                    .orderBy('date', 'desc').get()
                    .then(res => {
                        console.log('[DBRelation] [查询SDRelation] 成功: ', res)
                        log.info('[DBRelation] [查询SDRelation] 成功: ', res)
                        resolve(res)
                    }).catch(err => {
                        console.error('[DBRelation] [查询SDRelation] 失败: ', err)
                        log.error('[DBRelation] [查询SDRelation] 失败: ', err)
                        reject()
                    })
            } else if (articleType == 'technology') {
                db.collection('DTRelation')
                    .where({
                        technologyId: articleId
                    })
                    .orderBy('date', 'desc').get()
                    .then(res => {
                        console.log('[DBRelation] [查询DTRelation] 成功: ', res)
                        log.info('[DBRelation] [查询DTRelation] 成功: ', res)
                        resolve(res)
                    }).catch(err => {
                        console.error('[DBRelation] [查询DTRelation] 失败: ', err)
                        log.error('[DBRelation] [查询DTRelation] 失败: ', err)
                        reject()
                    })
            } else {
                resolve()
            }
        })
    }

    //根据relationId获取关联关系
    getRelationById(relationId, relationType) {
        return new Promise((resolve, reject) => {
            db.collection(relationType)
                .where({
                    _id: relationId
                }).get()
                .then(res => {
                    console.log('[DBRelation] [查询' + relationType + '] 成功: ', res)
                    log.info('[DBRelation] [查询' + relationType + '] 成功: ', res)
                    resolve(res)
                }).catch(err => {
                    console.error('[DBRelation] [查询' + relationType + '] 失败: ', err)
                    log.error('[DBRelation] [查询' + relationType + '] 失败: ', err)
                    reject()
                })
        })
    }

    //删除一篇文章的所有关联关系
    removeRelationByAId(articleId, articleType) {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'removeRelation',
                data: {
                    articleId: articleId,
                    articleType: articleType,
                }
            }).then(res => {
                console.log('[DBRelation] [删除关联关系] 成功: ', res.result)
                log.info('[DBRelation] [删除关联关系] 成功: ', res.result)
                resolve()
            }).catch(err => {
                console.error('[DBRelation] [删除关联关系] 失败: ', err)
                log.error('[DBRelation] [删除关联关系] 失败: ', err)
                reject()
            })
        })
    }

}

export {
    DBRelation
}