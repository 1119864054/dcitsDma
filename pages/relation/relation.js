import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({

  data: {
    articleId: '',
    articleType: '',
    relatino: [],
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

      if (options.articleType == 'demand') {
        let relation = this.data.relation
        for (let i = 0; i < relation.length; i++) {
          console.log(relation[i].suggestionId)
          let suggestion = dbArticle.getArticleByIdFromCache(relation[i].suggestionId, 'suggestion')
          this.setData({
            relationDetail: this.data.relationDetail.concat(suggestion)
          })
        }
      } else if (options.articleType == 'technology') {
        let relation = this.data.relation
        for (let i = 0; i < relation.length; i++) {
          console.log(relation[i].demandId)
          let demand = dbArticle.getArticleByIdFromCache(relation[i].demandId, 'demand')
          this.setData({
            relationDetail: this.data.relationDetail.concat(demand)
          })
        }
      }
    })
  }
})