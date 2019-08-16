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
    } else if (options.articleType == 'technology') {
      this.setData({
        articleType: 'demand'
      })
    }

    dbArticle.getAllArticleData(this.data.articleType).then(res1 => {
      let articleList = res1
      for (let i = 0; i < articleList.length; i++) {
        dbArticle.getUser(articleList[i].userId).then(res2 => {
          articleList[i].author = res2.username
          this.setData({
            articleList: this.data.articleList.concat(articleList[i])
          })
        })
      }
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

  onTapChange(e) {
    this.onChange('value', e)
  },

  submit() {
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
