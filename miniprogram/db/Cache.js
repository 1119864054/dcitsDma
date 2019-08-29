class Cache {
    constructor() {

    }

    //添加到缓存
    setCache(key, value) {
        // value.createTime = new Date().getTime()
        try {
            wx.setStorageSync(key, value)
            console.log('[Cache] [' + key + '] [同步缓存记录] 成功')
        } catch (err) {
            console.error('[Cache] [' + key + '] [同步缓存记录] 失败：', err)
        }
    }

    //从缓存读取数据
    getCache(storageKeyName) {
        try {
            let result = wx.getStorageSync(storageKeyName);
            if (!result || result.length < 1) {
                console.log('[Cache] [' + storageKeyName + '] [查询缓存记录] 未查询到记录', result)
            } else {
                console.log('[Cache] [' + storageKeyName + '] [查询缓存记录] 成功： ', result)
            }
            return result;
        } catch (err) {
            console.error('[Cache] [' + storageKeyName + '] [查询缓存记录] 失败：', err)
        }
    }

    //从缓存删除一条数据
    removeCache(storageKeyName) {
        try {
            let result = wx.removeStorageSync(storageKeyName)
            console.log('[Cache] [' + storageKeyName + '] [删除缓存' + storageKeyName + '] 成功： ', result)
        } catch (e) {
            console.log('[Cache] [' + storageKeyName + '] [删除缓存' + storageKeyName + '] 失败： ', e)
        }
    }

    getImageCached(articleId, imageUrl) {
        let image_cache = []
        let that = this
        for (let i = 0; i < imageUrl.length; i++) {
            wx.cloud.downloadFile({
                fileID: imageUrl[i]
            }).then(res => {
                if (res.statusCode === 200) {
                    console.log(imageUrl[i], '=>图片下载成功=>', res.tempFilePath)
                    let fs = wx.getFileSystemManager()
                    fs.saveFile({
                        tempFilePath: res.tempFilePath, // 传入一个临时文件路径
                        success(res) {
                            console.log('图片保存成功: ', res)
                            image_cache = image_cache.concat(res.savedFilePath)
                            that.setCache(articleId + '_image_cache', image_cache)
                        }
                    })
                } else {
                    console.error('图片下载响应失败: ', res.statusCode)
                }
            })
        }
    }
}

export {
    Cache
}