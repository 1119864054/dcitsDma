import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    articleId: '',
    articleType: '',
    relation: [],
    relationDetail: []
  },

  onLoad: function (options) {
    this.setData({
      articleId: options.articleId,
      articleType: options.articleType,
      relation: [],
      relationDetail: []
    })

    dbArticle.getRelation(options.articleId, options.articleType).then(res => {
      this.setData({
        relation: res.data
      })
      let relation = this.data.relation
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