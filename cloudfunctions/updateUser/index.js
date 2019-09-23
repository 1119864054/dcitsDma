// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    db.collection('user').doc(event.id)
      .update({
        data: {
          username: event.username,
          avatar: event.avatar,
        }
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
  })
}