// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    db.collection('comment').doc(event.commentId).update({
      data: {
        likeCount: _.inc(event.likeCount)
      }
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}