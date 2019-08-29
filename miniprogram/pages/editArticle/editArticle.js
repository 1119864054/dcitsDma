import { DBArticle } from '../../db/DBArticle.js';
import { Util } from '../../util/util.js';

const app = getApp()
var dbArticle = new DBArticle();
var util = new Util()

let myData = {
  imagesCloudId: [],
  articleTypeList: ['suggestion', 'demand', 'technology'],
  articleType: 'suggestion',
}

Page({

  data: {
    title: '',
    content: '',

    imgList: [],
    relation: [],
    typeIndex: 0,
    picker: ['需求意见', '业务需求', '项目需求'],
    length: 0,
    relationTitle: []
  },

  async onLoad(options) {
    let articleId = options.articleId
    let articleType = options.articleType

    let article = dbArticle.getCache(articleId)
    if (!article) {
      article = (await dbArticle.getArticleByAIdFromDB(articleId, articleType))[0]
      dbArticle.setCache(articleId, article)
    }

    let typeIndex = 0
    for (let i = 0; i < myData.articleTypeList.length; i++) {
      if (myData.articleTypeList[i] == articleType) {
        typeIndex = i
        break
      }
    }

    this.setData({
      title: article.title,
      content: article.content,
      imgList: article.articleImg,
      typeIndex: typeIndex
    })
  },

  onShow: function () {
    let relation = this.data.relation
    console.log('relation', relation)
    let relationTitle = []
    if (relation.length > 0) {
      for (let i = 0; i < relation.length; i++) {
        let array = relation[i].split('^^^')
        relationTitle.push(array[2])
      }
    }
    this.setData({
      relationTitle: relationTitle
    })
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
        console.log('imgList ', this.data.imgList)
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
        }
      }
    })
  },

  PickerChange(e) {
    console.log(e);
    this.setData({
      typeIndex: e.detail.value,
      relation: [],
      relationTitle: []
    })
    myData.articleType = myData.articleTypeList[e.detail.value]
  },

  getTitle: function (e) {
    this.data.title = e.detail.value
    console.log('title', this.data.title)
  },

  getContent: function (e) {
    this.data.content = e.detail.value
    this.setData({
      length: e.detail.value.length
    })
    console.log('content', this.data.content)
  },

  tapToSelectRelate: function (e) {
    wx.navigateTo({
      url: '/pages/selectRelation/selectRelation?articleType=' + myData.articleType
    });
  },

  async tapToSubmit() {
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
      await this.uploadImage()
      wx.showLoading({
        title: '上传文章',
      })
      await dbArticle.addNewArticle(myData.articleType, this.data.title, this.data.content, myData.imagesCloudId, this.data.relation)
      myData = {
        imagesCloudId: [],
        articleTypeList: ['suggestion', 'demand', 'technology'],
        articleType: 'suggestion',
      }
      wx.hideLoading();
      wx.switchTab({
        url: '/pages/articleList/articleList',
        success: (result) => {
          wx.showToast({
            title: '新增文章成功',
            duration: 3000,
          })
        },
      });
    }
  },

  async uploadImage() {
    wx.showLoading({
      title: '上传图片',
      mask: true
    })

    var that = this

    for (var i = 0; i < this.data.imgList.length; i++) {
      const filePath = this.data.imgList[i]
      // 上传图片
      const cloudPath = app.globalData.openid + i + (new Date()).valueOf() + filePath.match(/\.[^.]+?$/)

      console.log('filePath  ', filePath)
      console.log('cloudPath  ', cloudPath)

      await that.uploadOneImage(cloudPath, filePath)
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