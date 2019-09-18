// component/searchHilightTextView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**
     * {key:'关键字',str:'待匹配字符串'}
     */
    key: {
      type: String,
      observer: "_propertyChange"
    },
    str: String

  },

  /**
   * 组件的初始数据
   */
  data: {
    strArray: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _propertyChange: function (newVal) {
      let strArray = this.getHilightStrArray(this.data.str, newVal)
      this.setData({
        strArray: strArray
      })
    },

    getHilightStrArray: function (str, key) {
      return str.replace(new RegExp(`${key}`, 'g'), `%%${key}%%`).split('%%');
    }
  },
})