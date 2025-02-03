Page({
  data: {
    weight: '', 
    height: '', 
    bmiResult: null,
    healthStatus: ''
  },

  calculateBMI(e) {
    const { weight, height } = e.detail.value;

    if (!weight || !height) {
      wx.showToast({
        title: '请输入体重和身高',
        icon: 'none'
      });
      return;
    }

    this.setData({ 
      weight: weight,
      height: height
    });

    const heightInMeter = height / 100;
    const bmi = parseFloat(weight) / (heightInMeter * heightInMeter);
    this.setData({ bmiResult: bmi.toFixed(2) });

    if (bmi < 18.5) {
      this.setData({ healthStatus: '偏瘦' });
    } else if (bmi >= 18.5 && bmi < 24) {
      this.setData({ healthStatus: '正常' });
    } else if (bmi >= 24 && bmi < 28) {
      this.setData({ healthStatus: '过重' });
    } else {
      this.setData({ healthStatus: '肥胖' });
    }
  },

  getCurrentFormattedDate() {
    const date = new Date();
    const month = date.getMonth() + 1; 
    const day = date.getDate();

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    return `${formattedMonth}月${formattedDay}日`;
  },

  uploadRecord() {
    const db = wx.cloud.database();
    const BMI = db.collection('BMI');
    const { weight, height, bmiResult } = this.data; 

    if (bmiResult) {
      const Time = this.getCurrentFormattedDate();

      BMI.add({
        data: {
          weight: parseFloat(weight),
          height: parseFloat(height),
          bmi: parseFloat(bmiResult),
          Time: Time 
        },
        success: res => {
          console.log('Record uploaded successfully', res);
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        },
        fail: err => {
          console.error('Upload failed', err);
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '请先计算BMI',
        icon: 'none'
      });
    }
  }
});