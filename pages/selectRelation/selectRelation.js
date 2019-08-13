import {
  DBArticle
} from '../../db/DBArticle.js';

const app = getApp()
var dbArticle = new DBArticle();

Page({
  data: {
    value: [],
    articleType: '',
    articleList: []
  },
  onLoad: function (options) {
    if (options.articleType == 'demand') {
      this.setData({
        articleType: 'suggestion'
      })
    }else if(options.articleType == 'technology'){
      this.setData({
        articleType: 'demand'
      })
    }

    let articleList = dbArticle.getAllArticleData(this.data.articleType)
    this.setData({
      articleList: articleList
    })
  },
  onChange(field, e) {
    console.log(e.detail)
    const { value } = e.detail
    const data = this.data[field]
    const index = data.indexOf(value)
    const current = index === -1 ? [...data, value] : data.filter((n) => n !== value)

    this.setData({
      [field]: current,
    })

    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },

  onChange1(e) {
    this.onChange('value', e)
  },

  submit() {
    console.log('form发生了submit事件，携带数据为：', this.data.value)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    console.log(prevPage)
    prevPage.setData({
      relation: this.data.value
    })
    wx.navigateBack({
      delta: 1
    });
  },
})
