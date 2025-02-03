Page({
  data: {
    title: '', 
    content: '', 
    mood: '', 
    images: [], 
    currentDate: ''
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onMoodInput(e) {
    this.setData({ mood: e.detail.value });
  },

  chooseImage() {
    wx.chooseImage({
      count: 9, 
      success: (res) => {
        this.setData({
          images: res.tempFilePaths 
        });
      }
    });
  },

  getCurrentFormattedDate() {
    const date = new Date();
    const month = date.getMonth() + 1; 
    const day = date.getDate();

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    return `${formattedMonth}月${formattedDay}日`;
  },

submitDaily() {
  const db = wx.cloud.database();
  const dailyCollection = db.collection('daily');
  const { title, content, mood, images } = this.data;

  if (title && content && mood) {
    const currentDate = this.getCurrentFormattedDate(); 

    let uploadPromises = [];
    if (images.length > 0) {
      uploadPromises = images.map(imagePath => 
        new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath: `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`, 
            filePath: imagePath,
            success: res => {
              resolve(res.fileID); 
            },
            fail: err => {
              console.error('Failed to upload image', err);
              reject(err);
            }
          });
        })
      );
    }

    Promise.all(uploadPromises).then(fileIDs => {
      dailyCollection.add({
        data: {
          title: title,
          content: content,
          mood: mood,
          images: fileIDs, 
          date: currentDate 
        },
        success: res => {
          console.log('Record uploaded successfully', res);
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });

          // 清空输入数据
          this.setData({
            title: '',
            content: '',
            mood: '',
            images: []
          });
        },
        fail: err => {
          console.error('Upload failed', err);
          wx.showToast({
            title: '提交失败',
            icon: 'none'
          });
        }
      });
    }).catch(err => {
      console.error('Error uploading images', err);
      wx.showToast({
        title: '图片上传失败，请重试',
        icon: 'none'
      });
    });
  } else {
    wx.showToast({
      title: '有框为空，请填写所有内容',
      icon: 'none'
    });
  }
}
});
