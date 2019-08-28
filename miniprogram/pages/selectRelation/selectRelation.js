import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";

var dbArticle = new DBArticle();
var dbUser = new DBUser();
const app = getApp()
var myData = {
  articleType: '',
  value: [],
}
Page({
  data: {
    articleList: []
  },
  async onLoad(options) {
    console.log(options.articleType);
    if (options.articleType == 'demand') {
      myData.articleType = 'suggestion'
    } else if (options.articleType == 'technology') {
      myData.articleType = 'demand'
    }

    let articleList = await dbArticle.getAllArticleData(myData.articleType)
    for (let i = 0; i < articleList.length; i++) {
      let user = dbArticle.getCache(articleList[i].userId)
      if (!user) {
        user = await dbUser.getUser(articleList[i].userId)
        dbArticle.setCache(articleList[i].userId, user)
      }
      articleList[i].username = user.username
    }
    this.setData({
      articleList: articleList
    })
  },

  onTapChange(e) {
    console.log('选择的value', e.detail.value)
    myData.value = e.detail.value
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      detail: e.currentTarget.dataset.detail
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  submit() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    console.log(prevPage)
    prevPage.setData({
      relation: myData.value
    })
    wx.navigateBack({
      delta: 1
    });
  },
})
