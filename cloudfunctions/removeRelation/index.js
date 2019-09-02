const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-154312'
})

const db = cloud.database()

exports.main = async (event, context) => {
  if (event.articleType == 'demand') {
    let key = 'SDRelation'
    try {
      return await db.collection(key).where({
        demandId: event.articleId
      }).remove()
    } catch (e) {
      console.error(e)
    }
  } else if (event.articleType == 'technology') {
    let key = 'DTRelation'
    try {
      return await db.collection(key).where({
        technologyId: event.articleId
      }).remove()
    } catch (e) {
      console.error(e)
    }
  }
}