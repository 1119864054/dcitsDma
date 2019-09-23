import {
    DBArticle
} from '../../db/DBArticle';
import {
    Cache
} from "../../db/Cache";
import {
    DBPoint
} from "../../db/DBPoint";

const cache = new Cache()
const dbArticle = new DBArticle();
const dbPoint = new DBPoint();

const app = getApp()

let timer = 0

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
        articleIdList: [],
        typeIndex: 0,
        picker: ['我的需求', '业务需求', '项目需求'],
        length: 0,
    },

    onLoad: function (options) {
        let articleType = options.articleType
        let articleId = options.articleId
        let articleIdList = []
        if (articleId) {
            articleIdList.push(articleId)
        }
        if (articleType) {
            if (articleType == 'suggestion') {
                this.setData({
                    typeIndex: 1,
                    articleIdList
                })
                myData.articleType = 'demand'
            } else if (articleType == 'demand') {
                this.setData({
                    typeIndex: 2,
                    articleIdList
                })
                myData.articleType = 'technology'
            }
        }
    },

    async onShow() {
        let articleIdList = Array.from(new Set(this.data.articleIdList))
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

    PickerChange(e) {
        this.setData({
            typeIndex: e.detail.value,
            relation: [],
            articleIdList: []
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
            wx.showModal({
                title: '提示',
                content: '确定要提交了吗？',
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
        let res = dbArticle.addNewArticle(myData.articleType, myData.title, myData.content, myData.imagesCloudId, this.data.relation)
        res.then(articleId => {
            dbPoint.addPoint(app.globalData.id, "提出新的需求", 1, articleId, myData.title,myData.articleType)
            for (let i = 0; i < this.data.relation.length; i++) {
                dbPoint.addPoint(this.data.relation[i].userId, "需求被关联", 1, this.data.relation[i]._id, this.data.relation[i].title, this.data.relation[i].articleType)
            }
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
                        title: '新增需求成功',
                    })
                    timer = setTimeout(() => {
                        wx.navigateTo({
                            url: '/pages/article/article?articleId=' + articleId + '&articleType=' + myData.articleType
                        });
                    }, 800);
                },
            });
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

    async uploadImage() {
        wx.showLoading({
            title: '上传图片',
            mask: true
        })

        let that = this

        for (let i = 0; i < this.data.imgList.length; i++) {
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
        clearTimeout(timer)
    },

    onHide() {
        clearTimeout(timer)
    }
});