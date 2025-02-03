Page({
  // 点击“记录BMI”时触发的函数
  navigateToSubmit: function() {
    wx.navigateTo({
      url: '/pages/submit/submit',
    })
  },

  // 点击“查看记录”时触发的函数
  navigateToPast: function() {
    wx.navigateTo({
      url: '/pages/past/past',
    })
  },

  navigateTodaily: function() {
    wx.navigateTo({
      url: '/pages/daily/daily',
    })
  },

  navigateTodailypast: function() {
    wx.navigateTo({
      url: '/pages/dailypast/dailypast',
    })
  }
})