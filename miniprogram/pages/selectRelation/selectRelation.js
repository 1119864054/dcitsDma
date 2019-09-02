import { DBArticle } from "../../db/DBArticle";
import { DBUser } from "../../db/DBUser";
import { Cache } from '../../db/Cache';

var dbArticle = new DBArticle();
var dbUser = new DBUser();
const cache = new Cache()

var myData = {
  articleId: '',
  articleType: '',
  value: [],
}

Page({
  data: {
    articleList: []
  },
  async onLoad(options) {
    console.log(options.articleType);
    myData.articleId = options.articleId
    if (options.articleType == 'demand') {
      myData.articleType = 'suggestion'
    } else if (options.articleType == 'technology') {
      myData.articleType = 'demand'
    }

    let articleListNew = []
    let articleList = await dbArticle.getAllArticleData(myData.articleType)
    for (let i = 0; i < articleList.length; i++) {
      let user = cache.getCache(articleList[i].userId)
      if (!user) {
        user = await dbUser.getUser(articleList[i].userId)
        cache.setCache(articleList[i].userId, user)
      }
      articleList[i].username = user.username
      if (articleList[i]._id != myData.articleId) {
        articleListNew.push(articleList[i])
      }
    }
    this.setData({
      articleList: articleListNew
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
