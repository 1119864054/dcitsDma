import {
    DBArticle
} from '../../db/DBArticle.js';

import {
    Util
} from '../../util/util.js';

const app = getApp()
var dbArticle = new DBArticle();
var util = new Util()

Page({
    data: {
        title: '',
        content: '',
        images: [],
        imagesCloudId: [],
        articleTypeZh: '',
        articleType: '',
        relation: []
    },
    onLoad: function (options) {
        var articleType = options.articleType
        var articleTypeZh = util.getArticleTypeZh(articleType)
        this.setData({
            articleType: articleType,
            articleTypeZh: articleTypeZh
        })
    },
    onShow: function () {
        console.log('relation', this.data.relation)
    },
    chooseImage: function (e) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    images: that.data.images.concat(res.tempFilePaths)
                });

                console.log('image paths ', that.data.images)
            }
        })
    },
    uploadOneImage: function (cloudPath, filePath) {
        var that = this
        return new Promise((resolve, reject) => {
            wx.cloud.uploadFile({
                cloudPath,
                filePath,
            }).then(res => {
                console.log('[上传文件] 成功：', res)
                // app.globalData.fileID = res.fileID
                // app.globalData.cloudPath = cloudPath
                // app.globalData.imagePath = filePath
                that.setData({
                    imagesCloudId: that.data.imagesCloudId.concat(res.fileID)
                });
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
    async uploadImage() {
        wx.showLoading({
            title: '上传图片',
        })

        var that = this

        for (var i = 0; i < this.data.images.length; i++) {
            const filePath = this.data.images[i]
            // 上传图片
            const cloudPath = app.globalData.openid + i + (new Date()).valueOf() + filePath.match(/\.[^.]+?$/)

            console.log('filePath  ', filePath)
            console.log('cloudPath  ', cloudPath)

            await that.uploadOneImage(cloudPath, filePath)
        }
        console.log('[上传全部文件] 成功')
        wx.hideLoading();
    },
    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.images // 需要预览的图片http链接列表
        })
    },
    tapToSelectRelate: function (e) {
        wx.navigateTo({
            url: '/pages/selectRelation/selectRelation?articleType=' + this.data.articleType,
            success: (result) => {

            },
            fail: () => { },
            complete: () => { }
        });
    },
    getTitle: function (e) {
        this.setData({
            title: e.detail.value
        })
        console.log('title', this.data.title)
    },
    getContent: function (e) {
        this.setData({
            content: e.detail.value
        })
        console.log('content', this.data.content)
    },
    async tapToSubmit() {
        await this.uploadImage()
        wx.showLoading({
            title: '上传文章',
        })
        await dbArticle.addNewArticle(this.data.articleType, this.data.title, this.data.content, this.data.imagesCloudId, this.data.relation)
        wx.hideLoading();
        var that = this
        wx.switchTab({
            url: '/pages/' + that.data.articleType + '/' + that.data.articleType,
            success: (result) => {
                wx.showToast({
                    title: '新增' + that.data.articleTypeZh.substring(0, 2) + '成功',
                    duration: 3000,
                })
            },
        });

    }
});