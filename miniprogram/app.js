const log = require('./util/log.js')

App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    console.log("App.js onLaunch");

    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
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
      point: 0,
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
          wx.getUserInfo({
            lang: 'zh_CN',
            timeout: 10000,
            success: (res) => {
              console.log('[onLaunch] [获取用户信息userInfo] 成功 ', res)
              log.info('[onLaunch] [获取用户信息userInfo] 成功 ', res)
              this.globalData.username = res.userInfo.nickName
              this.globalData.avatar = res.userInfo.avatarUrl
              this.globalData.logged = true
              wx.hideLoading();
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },
            fail: (err) => {
              console.error('[onLaunch] [获取用户信息userInfo] 失败', err)
              log.error('[onLaunch] [获取用户信息userInfo] 失败', err)
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
    return new Promise((resolve, reject) => {
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
          }).get().then(user => {
            if (user.data[0]) {
              console.log('[onGetOpenid] [查询用户ByOpenid] 成功: ', user.data[0])
              log.info('[onGetOpenid] [查询用户ByOpenid] 成功: ', user.data[0])
              this.globalData.id = user.data[0]._id
            }
          }).catch(err => {
            console.error('[onGetOpenid] [查询用户ByOpenid] 失败: ', err)
          })
          resolve()
        },
        fail: err => {
          console.error('[云函数login] [login] [获取openid] 失败: ', err)
          log.error('[云函数login] [login] [获取openid] 失败: ', err)
          reject()
        }
      })
    })
  }
})