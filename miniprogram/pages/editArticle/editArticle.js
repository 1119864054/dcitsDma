import {
  DBArticle
} from '../../db/DBArticle';
import {
  Cache
} from '../../db/Cache';
import {
  DBRelation
} from '../../db/DBRelation';
import {
  DBHistory
} from '../../db/DBHistory';

const dbArticle = new DBArticle()
const cache = new Cache()
const dbRelation = new DBRelation()
const dbHistory = new DBHistory()

const app = getApp()

let myData = {
  imagesCloudId: [],
  articleTypeList: ['suggestion', 'demand', 'technology'],
  articleType: 'suggestion',
  articleId: '',
  oldArticle: ''
}

Page({

  data: {
    title: '',
    content: '',

    imgList: [],
    relation: [],
    articleIdList: [],
    typeIndex: 0,
    picker: ['需求意见', '业务需求', '项目需求'],
    length: 0,
  },

  async onLoad(options) {
    let articleId = options.articleId
    let articleType = options.articleType
    myData.articleId = articleId
    myData.articleType = articleType

    let article = cache.getCache(articleId)
    if (!article) {
      article = (await dbArticle.getArticleByAIdFromDB(articleId, articleType))
      cache.setCache(articleId, article)
    }
    console.log('myData.oldArticle = article', article)
    myData.oldArticle = JSON.parse(JSON.stringify(article))
    console.log('myData.oldArticle', myData.oldArticle)

    let typeIndex = 0
    for (let i = 0; i < myData.articleTypeList.length; i++) {
      if (myData.articleTypeList[i] == articleType) {
        typeIndex = i
        break
      }
    }

    let articleIdList = []
    if (articleType != 'suggestion') {
      let relation = await dbRelation.getRelation(articleId, articleType)
      if (articleType == 'demand') {
        for (let i = 0; i < relation.length; i++) {
          if (relation[i].suggestionId) {
            articleIdList.push(relation[i].suggestionId)
          }
        }
      } else if (articleType == 'technology') {
        for (let i = 0; i < relation.length; i++) {
          articleIdList.push(relation[i].demandId)
        }
      }
    }

    this.setData({
      title: article.title,
      content: article.content,
      imgList: article.articleImg,
      typeIndex: typeIndex,
      articleIdList: articleIdList
    })

    this.onShow()
  },

  async onShow() {
    let articleIdList = Array.from(new Set(this.data.articleIdList))
    console.log('articleIdList', articleIdList)
    let relation = []
    if (articleIdList.length > 0) {
      for (let i = 0; i < articleIdList.length; i++) {
        let article = cache.getCache(articleIdList[i])
        if (!article) {
          article = await dbArticle.getArticleByAIdFromDB(articleIdList[i], myData.articleType)
        }
        relation.push(article)
      }
      this.setData({
        relation,
        articleIdList
      })
    }
  },

  getTitle: function (e) {
    this.data.title = e.detail.value
  },

  getContent: function (e) {
    this.data.content = e.detail.value
    this.setData({
      length: e.detail.value.length
    })
  },

  tapToSelectRelate: function (e) {
    wx.navigateTo({
      url: '/pages/selectRelation/selectRelation?articleType=' + myData.articleType
    });
  },

  delRelation(e) {
    console.log('relation index:', e.currentTarget.dataset.index)
    let relation = this.data.relation
    let articleIdList = this.data.articleIdList
    relation.splice(e.currentTarget.dataset.index, 1)
    articleIdList.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      relation,
      articleIdList
    })
  },

  tapToSubmit() {
    let that = this
    if (!this.data.title) {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none',
      })
    } else if (!this.data.content) {
      wx.showToast({
        title: '正文不能为空',
        icon: 'none',
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确定编辑完成了吗？',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            that.submit()
          }
        },
        fail: () => {},
        complete: () => {}
      });
    }
  },

  async submit() {
    await this.uploadImage()
    wx.showLoading({
      title: '上传中...',
    })
    console.log('myData.oldArticle', myData.oldArticle)
    dbHistory.addHistory(myData.oldArticle)
    await dbArticle.updateArticle(myData.articleId, myData.articleType, this.data.title, this.data.content, myData.imagesCloudId, this.data.relation)
    myData = {
      imagesCloudId: [],
      articleTypeList: ['suggestion', 'demand', 'technology'],
      articleType: 'suggestion',
      articleId: '',
    }
    wx.hideLoading();
    wx.navigateBack({
      delta: 1,
      success: (result) => {
        wx.showToast({
          title: '更新文章成功',
        })
      },
    });
  },

  chooseImage() {
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },

  previewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  deleteImage(e) {
    console.log('myData.oldArticle', myData.oldArticle)
    wx.showModal({
      title: '提示',
      content: '确定要删除这张照片吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
          console.log('myData.oldArticle', myData.oldArticle)
        }
      }
    })
  },

  async uploadImage() {
    wx.showLoading({
      title: '上传图片',
      mask: true
    })

    let that = this

    for (let i = 0; i < this.data.imgList.length; i++) {
      const filePath = this.data.imgList[i]
      if (!filePath.startsWith('cloud')) {
        // 上传图片
        const cloudPath = app.globalData.openid + i + (new Date()).valueOf() + filePath.match(/\.[^.]+?$/)

        console.log('filePath  ', filePath)
        console.log('cloudPath  ', cloudPath)

        await that.uploadOneImage(cloudPath, filePath)
      } else {
        myData.imagesCloudId = myData.imagesCloudId.concat(filePath)
      }
    }
    console.log('[上传全部文件] 成功')
    wx.hideLoading();
  },

  uploadOneImage: function (cloudPath, filePath) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
      }).then(res => {
        console.log('[上传文件] 成功：', res)
        // app.globalData.fileID = res.fileID
        // app.globalData.cloudPath = cloudPath
        // app.globalData.imagePath = filePath
        myData.imagesCloudId = myData.imagesCloudId.concat(res.fileID)
        resolve()
      }).catch(error => {
        console.error('[上传文件] 失败：', error)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
        reject()
      })
    })
  },

})