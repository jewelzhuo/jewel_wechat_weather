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

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    city: '上海市',
    locationAuthType: UNPROMPTED
  },
  onPullDownRefresh(){
    this.getNow(function(){
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    var that = this;
    that.qqmapsdk = new QQMapWX({
      key: 'I77BZ-GZP3O-D77WO-S2F4Q-YAJXE-QZBQ6'
    });
    wx.getSetting({
      success: function(res) {
        let auth = res.authSetting['scope.userLocation'];
        let locationAuthType = auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED;
        that.setData({
          locationAuthType: locationAuthType
        });
        if(auth)
          that.getCityAndWeather(that)
        else
          that.getNow()
      },
      fail: function(){
        that.getNow()
      }
    })
  },
  getNow(callback){
    var that = this;
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: that.data.city
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
    let forecast = result.forecast;
    let hourlyWeather = [];
    let nowHour = new Date().getHours();
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    };
    hourlyWeather[0].time = '现在';
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
      url: '/pages/list/list?city=' + this.data.city
    })
  },
  onTapLocation(){
    var that = this;
    if (that.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({
        success: function(res){
          let auth = res.authSetting['scope.userLocation'];
          if(auth)
            that.getCityAndWeather(that)
        }
      })
    else
      that.getCityAndWeather(that)
  },
  getCityAndWeather(that){
    wx.getLocation({
      success: function(res){
        that.setData({
          locationAuthType: AUTHORIZED
        });
        that.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res){
            let city = res.result.address_component.city;
            that.setData({
              city: city,
              locationTipsText: ''
            });
            that.getNow()
          }
        });
      },
      fail: function(){
        that.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }
})
