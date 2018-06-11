// pages/list/list.js
const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data: {
    weekWeather: []
  },
  onLoad(){
    this.getWeekWeather()
  },
  onPullDownRefresh(){
    this.getWeekWeather(function(){
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    var that = this;
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: '广州市',
        time: new Date().getTime()
      },
      success: function(res){
        let result = res.data.result;
        that.setWeekWeather(result, that)
      },
      complete: function(){
        callback && callback()
      }
    })
  },
  setWeekWeather(result, that){
    let weekWeather = [];
    for (let i=0; i<7; i++){
      let date = new Date();
      date.setDate(date.getDate() + i);
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: result[i].minTemp + '° - ' + result[i].maxTemp + '°',
        iconPath: '/images/' + result[i].weather + '-icon.png'
    })
    };
    weekWeather[0].day = '今天';
    that.setData({
      weekWeather:weekWeather
    })
  }
})