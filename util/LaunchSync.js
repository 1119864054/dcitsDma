class LaunchSync {
  constructor() {

  }

  Clear(){
    var res = wx.getStorageInfoSync();
    if(!res){
      wx.clearStorageSync();
    }
  }

  Sync(storageKeyName) {
    const db = wx.cloud.database()
    var storageData = wx.getStorageSync(storageKeyName);
    if (!storageData) {
      db.collection(storageKeyName)
        .orderBy('date', 'desc')
        .get({
          success: res => {
            console.log('[LaunchSync] ['+storageKeyName+'] [查询数据库记录] 成功: ', res)
            wx.setStorageSync(storageKeyName, res.data);
            console.log('[LaunchSync] [' + storageKeyName +'] [同步缓存记录] 成功: ', res.data)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[LaunchSync] [' + storageKeyName +'] [查询数据库记录] 失败：', err)
          }
        })
    }
  }

}

export {
  LaunchSync
}