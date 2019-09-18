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
        label: '新建需求',
        icon: '../../images/fabbutton/write_fill.svg'
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
        wx.navigateTo({
          url: '/pages/newArticle/newArticle'
        });
      } else {
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