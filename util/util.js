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
}

export {
  Util
}