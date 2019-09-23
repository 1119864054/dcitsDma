const db = wx.cloud.database()

import {
    Util
} from '../util/util';

const util = new Util()

const log = require('../util/log.js')

class DBRelation {
    constructor() {

    }

    //添加关联关系
    addRelation(articleType, firstId, secondId) {
        if (articleType == 'demand') {
            return new Promise((resolve, reject) => {
                db.collection('relation').add({
                    data: {
                        suggestionId: firstId,
                        demandId: secondId,
                        date: util.formatTime(new Date()),
                    }
                }).then(res => {
                    console.log('[DBRelation] [新增' + articleType + '] 成功: ', res._id)
                    log.info('[DBRelation] [新增' + articleType + '] 成功: ', res._id)
                    resolve(res._id)
                }).catch(err => {
                    console.error('[DBRelation] [新增' + articleType + '] 失败: ', err)
                    log.error('[DBRelation] [新增' + articleType + '] 失败: ', err)
                    reject()
                })
            })
        } else if (articleType == 'technology') {
            return new Promise((resolve, reject) => {
                db.collection('relation').add({
                    data: {
                        demandId: firstId,
                        technologyId: secondId,
                        date: util.formatTime(new Date()),
                    }
                }).then(res => {
                    console.log('[DBRelation] [新增' + articleType + '] 成功: ', res._id)
                    log.info('[DBRelation] [新增' + articleType + '] 成功: ', res._id)
                    resolve(res._id)
                }).catch(err => {
                    console.error('[DBRelation] [新增' + articleType + '] 失败: ', err)
                    log.error('[DBRelation] [新增' + articleType + '] 失败: ', err)
                    reject()
                })
            })
        }
    }

    //获取关联关系
    getRelation(articleId, articleType) {
        return new Promise((resolve, reject) => {
            if (articleType == 'suggestion') {
                db.collection('relation')
                    .where({
                        suggestionId: articleId
                    })
                    .orderBy('date', 'desc').get()
                    .then(res => {
                        console.log('[DBRelation] [查询relation] 成功: ', res.data)
                        log.info('[DBRelation] [查询relation] 成功: ', res.data)
                        resolve(res.data)
                    }).catch(err => {
                        console.error('[DBRelation] [查询relation] 失败: ', err)
                        log.error('[DBRelation] [查询relation] 失败: ', err)
                        reject()
                    })
            } else if (articleType == 'demand') {
                db.collection('relation')
                    .where({
                        demandId: articleId
                    })
                    .orderBy('date', 'desc').get()
                    .then(res => {
                        console.log('[DBRelation] [查询relation] 成功: ', res.data)
                        log.info('[DBRelation] [查询relation] 成功: ', res.data)
                        resolve(res.data)
                    }).catch(err => {
                        console.error('[DBRelation] [查询relation] 失败: ', err)
                        log.error('[DBRelation] [查询relation] 失败: ', err)
                        reject()
                    })
            } else if (articleType == 'technology') {
                db.collection('relation')
                    .where({
                        technologyId: articleId
                    })
                    .orderBy('date', 'desc').get()
                    .then(res => {
                        console.log('[DBRelation] [查询relation] 成功: ', res.data)
                        log.info('[DBRelation] [查询relation] 成功: ', res.data)
                        resolve(res.data)
                    }).catch(err => {
                        console.error('[DBRelation] [查询relation] 失败: ', err)
                        log.error('[DBRelation] [查询relation] 失败: ', err)
                        reject()
                    })
            } else {
                resolve()
            }
        })
    }

    //根据relationId获取关联关系
    getRelationById(relationId) {
        return new Promise((resolve, reject) => {
            db.collection('relation')
                .where({
                    _id: relationId
                }).get()
                .then(res => {
                    console.log('[DBRelation] [查询' + relationId + '] 成功: ', res.data[0])
                    log.info('[DBRelation] [查询' + relationId + '] 成功: ', res.data[0])
                    resolve(res.data[0])
                }).catch(err => {
                    console.error('[DBRelation] [查询' + relationId + '] 失败: ', err)
                    log.error('[DBRelation] [查询' + relationId + '] 失败: ', err)
                    reject()
                })
        })
    }

    //删除一篇文章的所有关联关系
    // removeRelationByAId(articleId, articleType) {
    //     return new Promise((resolve, reject) => {
    //         wx.cloud.callFunction({
    //             name: 'removeRelation',
    //             data: {
    //                 articleId: articleId,
    //                 articleType: articleType,
    //             }
    //         }).then(res => {
    //             console.log('[DBRelation] [删除关联关系] 成功: ', res.result)
    //             log.info('[DBRelation] [删除关联关系] 成功: ', res.result)
    //             resolve()
    //         }).catch(err => {
    //             console.error('[DBRelation] [删除关联关系] 失败: ', err)
    //             log.error('[DBRelation] [删除关联关系] 失败: ', err)
    //             reject()
    //         })
    //     })
    // }
}

export {
    DBRelation
}