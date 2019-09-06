// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    db.collection(event.articleType).doc(event.articleId).update({
      data: {
        favorCount: _.inc(event.favorCount)
      }
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}