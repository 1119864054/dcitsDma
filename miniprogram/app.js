const log = require('./util/log.js')

App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    console.log("App.js onLaunch");

    // 清除缓存
    // wx.clearStorageSync();

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      openid: '',
      id: '',
      username: '',
      avatar: '',
      sign: '',
      point: 0,
      logged: false,
    }

    this.onGetOpenid()

    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        console.log(e);
        this.globalData.windowHeight = e.windowHeight
        this.globalData.screenHeight = e.screenHeight
        this.globalData.screenWidth = e.screenWidth
        this.globalData.windowWidth = e.windowWidth
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },

  onGetOpenid: function () {
    let that = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数login] [login] [获取openid] 成功: ', res.result.openid)
        log.info('[云函数login] [login] [获取openid] 成功: ', res.result.openid)
        that.globalData.openid = res.result.openid
        let db = wx.cloud.database()
        db.collection('user').where({
          _openid: res.result.openid
        }).get().then(res => {
          let user = res.data[0]
          if (user) {
            console.log('[onGetOpenid] [查询用户ByOpenid] 成功: ', user)
            log.info('[onGetOpenid] [查询用户ByOpenid] 成功: ', user)
            that.globalData.id = user._id
            that.globalData.username = user.username
            that.globalData.avatar = user.avatar
            that.globalData.logged = true
          } else {
            console.log('[onGetOpenid] [查询用户ByOpenid] 用户不存在')
            log.info('[onGetOpenid] [查询用户ByOpenid] 用户不存在')
          }
        }).catch(err => {
          console.error('[onGetOpenid] [查询用户ByOpenid] 失败: ', err)
        })
      },
      fail: err => {
        console.error('[云函数login] [login] [获取openid] 失败: ', err)
        log.error('[云函数login] [login] [获取openid] 失败: ', err)
      }
    })
  }
})