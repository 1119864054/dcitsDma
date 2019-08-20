import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();
var myData = {
  articleId: '',
  articleType: '',
  relation: []
}

Page({

  data: {
    relationDetail: []
  },

  onLoad: function (options) {
    myData.articleId = options.articleId
    myData.articleType = options.articleType

    dbArticle.getRelation(options.articleId, options.articleType).then(res => {
      myData.relation = res.data
      let relation = res.data
      if (options.articleType == 'demand') {
        for (let i = 0; i < relation.length; i++) {
          dbArticle.getArticleByAIdFromDB(relation[i].suggestionId, 'suggestion').then(res1 => {
            let relationDetail = res1[0]
            dbArticle.getUser(relationDetail.userId).then(res2 => {
              relationDetail.author = res2.username
              this.setData({
                relationDetail: this.data.relationDetail.concat(relationDetail)
              })
            })
          })
        }
      } else if (options.articleType == 'technology') {
        for (let i = 0; i < relation.length; i++) {
          dbArticle.getArticleByAIdFromDB(relation[i].denamdId, 'demand').then(res1 => {
            let relationDetail = res1[0]
            dbArticle.getUser(relationDetail.userId).then(res2 => {
              relationDetail.author = res2.username
              this.setData({
                relationDetail: this.data.relationDetail.concat(relationDetail)
              })
            })
          })
        }
      }
    })
  }
})