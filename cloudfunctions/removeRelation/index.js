// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  if (event.articleType == 'demand') {
    try {
      return await db.collection('relation').where({
        demandId: event.articleId
      }).remove()
    } catch (e) {
      console.error(e)
    }
  } else if (event.articleType == 'technology') {
    try {
      return await db.collection('relation').where({
        technologyId: event.articleId
      }).remove()
    } catch (e) {
      console.error(e)
    }
  }
}