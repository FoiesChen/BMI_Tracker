Page({
  data: {
    dailyRecords: [], // 存储从云数据库获取的日记记录
    loading: true, // 加载状态
  },

  onLoad() {
    this.fetchDailyRecords();
  },

  // 从云数据库获取日记记录
  fetchDailyRecords() {
    const db = wx.cloud.database();
    const dailyCollection = db.collection('daily');

    dailyCollection.get().then(res => {
      // 获取所有图片的下载链接
      Promise.all(res.data.map(record => 
        this.getImageUrls(record)
      )).then(updatedRecords => {
        this.setData({
          dailyRecords: updatedRecords,
          loading: false
        });
      }).catch(err => {
        console.error('Error processing images', err);
        wx.showToast({
          title: '加载图片失败，请重试',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
    }).catch(err => {
      console.error('Failed to fetch daily records', err);
      wx.showToast({
        title: '加载日记失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    });
  },

  // 获取单条记录中所有图片的下载链接
  getImageUrls(record) {
    if (record.images && record.images.length > 0) {
      return Promise.all(record.images.map(imagePath => 
        new Promise((resolve, reject) => {
          wx.cloud.getTempFileURL({
            fileList: [imagePath],
            success: res => {
              resolve(res.fileList[0].tempFileURL);
            },
            fail: err => {
              console.error('Failed to get temp file URL for:', imagePath, err);
              reject(err);
            }
          });
        })
      )).then(urls => {
        record.imageUrls = urls;
        return record;
      }).catch(err => {
        console.error('Failed to process image URLs for a record:', err);
        throw err; // 确保任何错误都会被 catch 块捕获
      });
    } else {
      return Promise.resolve(record); // 如果没有图片，则直接返回记录
    }
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageIndex = e.currentTarget.dataset.imageindex;
    const record = this.data.dailyRecords[index];
    wx.previewImage({
      current: record.imageUrls[imageIndex], // 当前显示图片的http链接
      urls: record.imageUrls // 所有要预览的图片的http链接列表
    });
  },

  // 删除日记记录
  deleteRecord(e) {
    const index = e.currentTarget.dataset.index;
    const recordId = this.data.dailyRecords[index]._id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const db = wx.cloud.database();
            const dailyCollection = db.collection('daily');

            await dailyCollection.doc(recordId).remove();

            let updatedRecords = [...this.data.dailyRecords];
            updatedRecords.splice(index, 1);

            this.setData({
              dailyRecords: updatedRecords
            });

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (err) {
            console.error('Failed to delete record', err);
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});