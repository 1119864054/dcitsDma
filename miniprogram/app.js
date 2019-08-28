App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    console.log("App.js onLaunch");

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'test-154312',
        traceUser: true,
      })
    }

    this.globalData = {
      suggestionKey: 'suggestion',
      demandKey: 'demand',
      technologyKey: 'technology',
      openid: '',
      id: '',
      username: '',
      avatar: '',
      sign: '',
      logged: false,
    }

    this.onGetOpenid()

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.showLoading({
            title: "正在登录",
            mask: true,
          });
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            lang: 'zh_CN',
            timeout: 10000,
            success: (res) => {
              console.log('[login] [获取用户信息userInfo] 成功 ', res)
              this.globalData.username = res.userInfo.nickName
              this.globalData.avatar = res.userInfo.avatarUrl
              this.globalData.logged = true
              wx.hideLoading();
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },
            fail: () => {
              console.error('[login] [获取用户信息userInfo] 失败')
            }
          });
        }
      }
    })

    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        console.log(e);
        this.globalData.windowHeight = e.windowHeight
        this.globalData.screenHeight = e.screenHeight
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
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数login] [login] [获取openid] 成功: ', res.result.openid)
          that.globalData.openid = res.result.openid
          let db = wx.cloud.database()
          db.collection('user').where({
            _openid: res.result.openid
          }).get().then(user => {
            console.log('[onGetOpenid] [查询用户ByOpenid] 成功: ', user.data[0])
            this.globalData.id = user.data[0]._id
          }).catch(err => {
            console.error('[onGetOpenid] [查询用户ByOpenid] 失败: ', err)
          })
          resolve()
        },
        fail: err => {
          console.error('[云函数login] [login] [获取openid] 失败: ', err)
          reject()
        }
      })
    })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {

  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {

  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {

  }
})