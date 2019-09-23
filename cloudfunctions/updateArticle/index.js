// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    db.collection(event.articleType).doc(event.articleId).update({
      data: {
        title: event.title,
        content: event.content,
        date: event.date,
        updated: true,
        articleImg: event.articleImg
      }
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}