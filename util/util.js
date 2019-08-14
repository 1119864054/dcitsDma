class Util {
  constructor() {

  }

  getArticleTypeZh(articleType) {
    var articleTypeZh = '';
    if (articleType == 'suggestion') {
      articleTypeZh = '意见箱'
    }
    if (articleType == 'demand') {
      articleTypeZh = '需求版'
    }
    if (articleType == 'technology') {
      articleTypeZh = '技术天地'
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
   
    return [year, month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute, second].map(this.formatNumber).join(':')
  }

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
}

export {
  Util
}