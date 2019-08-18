Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type:String, 
      value:''
    },
    detail: {
      type:String, 
      value:''
    },
    date: {
      type:String, 
      value:''
    },
    articleId: {
      type:String, 
      value:''
    },
    articleType: {
      type:String, 
      value:''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  lifetimes: {
    attached: function () {
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  options: {
    addGlobalClass: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapToArticle: function (e) {
      wx.navigateTo({
        url: '/pages/article/article?articleId=' + this.data.articleId + '&articleType=' + this.data.articleType
      });
    }
  }
})
