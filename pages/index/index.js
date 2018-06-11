//index.js
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
};

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
};

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: ''
  },
  onPullDownRefresh(){
    this.getNow(function(){
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    this.getNow();
  },
  getNow(callback){
    var that = this;
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '广州市',
      },
      success: function (res) {
        let result = res.data.result;
        that.setNow(result, that);
        that.setHourlyWeather(result, that);
        that.setToday(result,that);
      },
      complete: function(){
        callback && callback()
      }
    })
  },
  setNow(result, that){
    let temp = result.now.temp;
    let weather = result.now.weather;
    console.log(temp, weather);
    that.setData({ //这里注意：教学视频是用this，但报错，需要用that才正确
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather], //这里为什么要用中括号，而不是花括号
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    });
  },
  setHourlyWeather(result, that){
    let forecast = result.forecast
    let hourlyWeather = []
    let nowHour = new Date().getHours()
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    that.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result, that){
    let date = new Date();
    that.setData({
      todayTemp: result.today.minTemp + '° - ' + result.today.maxTemp + '°',
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}今天`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },
  onTapLocation(){
    wx.getLocation({
      success: function(res){
        console.log(res.latitude, res.longitude)
      }
    })
  }
})
