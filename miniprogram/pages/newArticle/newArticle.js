import { DBArticle } from '../../db/DBArticle';

var dbArticle = new DBArticle();

const app = getApp()

const log = require('../../util/log.js')

let myData = {
    title: '',
    content: '',
    imagesCloudId: [],
    articleTypeList: ['suggestion', 'demand', 'technology'],
    articleType: 'suggestion',
}

Page({

    data: {
        imgList: [],
        relation: [],
        typeIndex: 0,
        picker: ['需求意见', '业务需求', '项目需求'],
        length: 0,
        relationTitle: []
    },

    onLoad: function (options) {
    },

    onShow: function () {
        let relation = this.data.relation
        console.log('relation', relation)
        log.info('relation', relation)
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
        this.setData({
            typeIndex: e.detail.value,
            relation: [],
            relationTitle: []
        })
        myData.articleType = myData.articleTypeList[e.detail.value]
    },

    getTitle: function (e) {
        myData.title = e.detail.value
    },

    getContent: function (e) {
        myData.content = e.detail.value
        this.setData({
            length: e.detail.value.length
        })
    },

    tapToSelectRelate: function (e) {
        wx.navigateTo({
            url: '/pages/selectRelation/selectRelation?articleType=' + myData.articleType + '&articleId=' + myData.articleId
        });
    },

    async tapToSubmit() {
        if (!myData.title) {
            wx.showToast({
                title: '标题不能为空',
                icon: 'none',
            })
        } else if (!myData.content) {
            wx.showToast({
                title: '正文不能为空',
                icon: 'none',
            })
        } else {
            await this.uploadImage()
            wx.showLoading({
                title: '上传文章',
            })
            let res = dbArticle.addNewArticle(myData.articleType, myData.title, myData.content, myData.imagesCloudId, this.data.relation)
            res.then(articleId => {
                myData = {
                    title: '',
                    content: '',
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
                        })
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages/article/article?articleId=' + articleId + '&articleType=' + myData.articleType
                            });
                        }, 800);
                    },
                });
            })

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

    onUnload() {
        console.log('确定放弃此次编辑？')
    }
});