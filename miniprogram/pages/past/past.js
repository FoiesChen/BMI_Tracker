// past.js
Page({
  data: {
    bmiRecords: [],
    loading: true,
  },

  onLoad() {
    this.fetchBMIData();
  },

  // 从云数据库获取BMI数据的方法
  fetchBMIData() {
    const db = wx.cloud.database();
    const BMI = db.collection('BMI');

    BMI.get()
      .then(res => {
        console.log('Fetched BMI records:', res.data);
        this.setData({
          bmiRecords: res.data,
          loading: false,
        });
      })
      .catch(err => {
        console.error('Failed to fetch BMI records', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
  },

  // 删除指定ID的BMI记录
  deleteRecord(e) {
    const recordId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const db = wx.cloud.database();
          const BMI = db.collection('BMI');

          BMI.doc(recordId).remove()
            .then(() => {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });

              // 更新本地数据
              this.setData({
                bmiRecords: this.data.bmiRecords.filter(record => record._id !== recordId)
              });
            })
            .catch(err => {
              console.error('Failed to delete BMI record', err);
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            });
        }
      }
    });
  }
});