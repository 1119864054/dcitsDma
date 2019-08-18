import {
  DBArticle
} from '../db/DBArticle.js';

class Util {
  constructor() {

  }

  getArticleTypeZh(articleType) {
    var articleTypeZh = '';
    if (articleType == 'suggestion') {
      articleTypeZh = '需求意见箱'
    }
    if (articleType == 'demand') {
      articleTypeZh = '业务需求'
    }
    if (articleType == 'technology') {
      articleTypeZh = '项目需求'
    }
    return articleTypeZh;
  }

  formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(this.formatNumber).join('-') + ' ' + [hour, minute, second].map(this.formatNumber).join(':')
  }

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }

  
  getImageCached(articleId, imageUrl) {
    let dbArticle = new DBArticle();
    let image_cache = []
    for (let i = 0; i < imageUrl.length; i++) {
      wx.cloud.downloadFile({
        fileID: imageUrl[i]
      }).then(res => {
        if (res.statusCode === 200) {
          console.log(imageUrl[i], '=>图片下载成功=>', res.tempFilePath)
          const fs = wx.getFileSystemManager()
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              console.log('图片保存成功: ', res)
              image_cache = image_cache.concat(res.savedFilePath)
              dbArticle.setCache(articleId + '_image_cache', image_cache)
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
  Util
}