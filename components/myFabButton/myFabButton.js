// components/myFabButton/myFabButton.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    buttons: {
      type: Array,
      value: [{
        label: '新建意见',
        appParameter: 'suggestion',
        icon: '../../images/fabbutton/suggestion.svg'
      }, {
        label: '新建需求',
        appParameter: 'demand',
        icon: '../../images/fabbutton/demand.svg'
      }, {
        label: '新建技术',
        appParameter: 'technology',
        icon: '../../images/fabbutton/technology.svg'
      }]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapToNewArticle(e) {
      if (app.globalData.logged) {
        let articleType = e.detail.value.appParameter;
        console.log(articleType)
        wx.navigateTo({
          url: '/pages/newArticle/newArticle?articleType=' + articleType,
          success: (result) => {

          },
          fail: () => { },
          complete: () => { }
        });
      }
      else {
        wx.switchTab({
          url: '/pages/user/user',
          success: () => {
            wx.showToast({
              title: '请先登录',
              icon: 'none',
            });
          }
        });

      }
    }
  }
})
