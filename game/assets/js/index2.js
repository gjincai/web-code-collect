;(function ($) {
  var lottery_num = 0 // 抽奖次数

  var App = function () {
    // this.config = {
    //   project_id: '11',
    //   sdkapi_secret: 'SQz7RrTGbb0j7NCK',
    //   commonapi_secret: 'JZ0PJRVzpUctYExk',
    //   activity_secret: 'JZ0Psf67jc10U05cykVzpUctYExk',
    //   payapi_key: 'webpayqrcode',
    //   payapi_web_url: 'https://pay.shiyue.com',
    //   sdkapi_web_url: 'https://api.shiyue.com',
    //   commonapi_web_url: 'https://api-common.shiyue.com',
    //   activityapi_url: 'https://activity.shiyue.com',
    //   base_url: 'https://sszg.shiyue.com/m/towns.html',
    // }

    this.config = {
      project_id: '11',
      sdkapi_secret: 'SQz7RrTGbb0j7NCK',
      commonapi_secret: 'JZ0PJRVzpUctYExk',
      activity_secret: 'JZ0Psf67jc10U05cykVzpUctYExk',
      payapi_key: 'webpayqrcode',
      payapi_web_url: 'http://test-pay.shiyue.com',
      sdkapi_web_url: 'http://test.shiyue.com',
      commonapi_web_url: 'http://test-common-api.shiyue.com',
      activityapi_url: 'http://test-activity.shiyue.com',
      base_url: 'http://test-cms-sszg.shiyue.com/m/towns.html',
    }

    this.$btn_join = $('.btn-join')
    // page012
    this.j_page0 = $('.j_page0')
    this.j_page1 = $('.j_page1')
    this.j_page2 = $('.j_page2')
    // 点击page0封面
    this.j_contBg = $('.j_contBg')
    // 登录，绑定角色弹窗
    this.j_dialogLogin = $('.j_dialogLogin')
    this.j_dialogBind = $('.j_dialogBind')
  }
  $.extend(App.prototype, {
    bindEvent: function() {
      // page0,点击封面
      this.j_contBg.on('click', $.proxy(this.loginPop, this))
      // 进入page1,判断是否登录：弹窗：
      // 登录完判断是否绑定：
      // 绑定完：开始展示报告：
      $('.j_dialogLogin').on('click', '.login-submit', $.proxy(this.loginSubmit, this))
    },
    // 页面简单操作绑定
    initPageAction: function() {
      var that = this
      // 测试：===========
      that.j_page0.hide()
      that.j_page1.css('display', "flex")
       // 测试：===========
      // page0点击封面,进入page1
      that.j_contBg.on('click', function(){
        that.j_page0.hide()
        that.j_page1.css('display', "flex")
      })
      $('.cont-start').on('click', function(){
        that.j_page0.hide()
        that.j_page1.css('display', "flex")
      })
      // page1: 点击查看报告
      that.initSwiper()
      $('.j_btnViewReport').on('click', function() {
        that.j_page1.hide()
        that.j_page1.css({'display':"flex"})
        that.initSwiper()
      })
      that.loginSwitch()
    },
    // page1: 报告首页：检查登录，检查角色绑定，
    init: function () {
      this.initPageAction()
    },
    initSwiper: function() {
      var mySwiper = new Swiper('.swiper-container-page')
      mySwiper.slideTo(8)
      nowIndex = 1
      $('.j_slidePrev').click(function() {
        // mySwiper.slidePrev()
        console.log(nowIndex)
        if (nowIndex !== 0) {
          nowIndex = nowIndex - 1
          mySwiper.slideTo(nowIndex)
          $('.j_controlCenter').text(nowIndex + 1 + '/7')
        }
      })
      $('.j_slideNext').click(function() {
        // mySwiper.slideNext()
        console.log(nowIndex)
        if (nowIndex !== 8) {
          nowIndex = nowIndex + 1
          mySwiper.slideTo(nowIndex)
          $('.j_controlCenter').text(nowIndex + 1 + '/7')
        }
      })
      var mySwiper1 = new Swiper('.swiper-container-box5', {
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      })
      var mySwiper1 = new Swiper('.swiper-container-box6', {
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      })
      // $('.j_swiperControl').hide()
    },
    // 登录绑定
    loginSwitch: function() {
      // 登录切换
      $('.j_loginMenu').on('click', 'li', function() {
        var loginType = $(this).attr('data-login_type')
        console.log(loginType)
        $('.j_contentLogin').removeClass('login-type1 login-type2 login-type3')
        $('.j_contentLogin').addClass('login-type'+loginType)
        $('.login-box').hide()
        $('.login-box').eq(loginType-1).show()
      })
      // 关闭登录弹窗
      $('.j_dialogClose').on('click', function(){
        $('.j_dialogLogin').addClass('sy-hide')
      })
      $('.j_dialogClose2').on('click', function(){
        $('.j_dialogBind').addClass('sy-hide')
      })
    },
    //设置登录信息
    setAccInfo: function (acc_id, type) {
      var that = this
      //登录成功获取信息
      that.getInfo('login')

      //登录成功生成二维码
      that.qrcodeInit(acc_id, type)
    },
    //登录弹窗
    loginPop: function (e) {
      this.$dialog_login.show()
      this.getCaptcha('login')

      if (this.login_type == '3') {
        this.$dialog_login.find('.select-menu li').removeClass('cur')
        this.$dialog_login.find('.select-menu li').eq(2).addClass('cur')

        this.$dialog_login.find('.dialog-login').removeClass('t1 t2 t3')
        this.$dialog_login.find('.dialog-login').addClass('t3')

        this.$dialog_login.find('.login-box').hide()
        this.$dialog_login.find('.login-box').eq(2).show()
      }
    },
    //登录切换
    loginTab: function (e) {
      var e = e || window.event,
        current = e.currentTarget,
        index = $(current).index(),
        type = $(current).attr('data-login_type')

      this.login_type = type

      $(current).addClass('cur').siblings().removeClass('cur')
      this.$dialog_login.find('.dialog-login').removeClass('t1 t2 t3')
      this.$dialog_login.find('.dialog-login').addClass('t' + type)

      this.$dialog_login.find('.login-box').hide()
      this.$dialog_login.find('.login-box').eq(index).show()
    },
    //获取图片验证码
    getCaptcha: function (type) {
      var that = this,
        api_params = {}
      api_params['type'] = type || 'login'
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.sdkapi_secret)

      $.ajax({
        url: that.config.sdkapi_web_url + '/web/captcha',
        type: 'post',
        data: api_params,
        success: function (response) {
          if (response.code == 0) {
            that.$dialog_login.find('.pic-captcha').attr('src', response.data.captcha)
            that.$dialog_login.find('input[name="captcha"]').val()
            that.$dialog_login.find('.captcha').show()
          } else {
            that.$dialog_login.toast({
              content: '获取图片验证码失败，请稍候再试~',
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            that.$dialog_login.toast({
              content: '获取图片验证码失败，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //刷新图片验证码
    refreshCaptcha: function (e) {
      this.getCaptcha('login')
    },
    //短信验证码倒计时
    countDown: function (obj) {
      var that = this,
        count = 60 //倒计时时间
      that.sms_timer = setInterval(function () {
        if (count == 0) {
          obj.text('获取验证码').removeAttr('disabled').removeClass('gray')
          clearInterval(that.sms_timer)
        } else {
          obj.text('已发送(' + count + 's)')
          obj.attr('disabled', true).addClass('gray')
        }
        count--
      }, 1000)
    },
    //获取短信验证码
    getSms: function (obj, sms_type) {
      var that = this,
        api_params = {},
        phone_number = obj.find('input[name="phone"]').val()

      if (phone_number == '' || !that.isPhone(phone_number)) {
        obj.toast({
          content: '请输入11位手机号码~',
          duration: 2000,
        })
        return false
      }

      api_params['phone_number'] = phone_number
      api_params['sms_type'] = sms_type
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.sdkapi_secret)

      that.countDown(obj.find('.get-sms'))

      $.ajax({
        url: that.config.sdkapi_web_url + '/web/sms/send',
        type: 'post',
        data: api_params,
        success: function (response) {
          if (response.code == 0) {
            obj.toast({
              content: '手机验证码发送成功~',
              duration: 2000,
            })
          } else {
            obj.find('.get-sms').text('获取验证码').removeAttr('disabled').removeClass('gray')
            clearInterval(that.sms_timer)

            obj.toast({
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            obj.toast({
              content: '服务器出小差，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //设置信息
    setInfo: function (info, status) {
      var that = this

      that.$login_start.hide() //登录前
      that.$login_after.show() //登录后
      that.$login_prize.show() //我的奖品

      // 联运
      if (info.acc_type == '2') {
        var str = info.role_info['server_name'] + '-' + info.role_info['role_name']
        that.$login_after.find('span').html(str)
      } else {
        // 账号
        var acc = storage.getItem('sy_acc')
        var name = acc['phone_number'] == '' ? acc['name'] : acc['phone_number']
        that.$login_after.find('span').html(name)

        if (status == 'login') {
          if (info.role_info == null) {
            that.$login_role_change.hide()
            that.$login_role_bind.show()
            // that.$dialog_bind.show()

            that.bindPop()
          } else {
            var str = info.role_info['server_name'] + '-' + info.role_info['role_name']
            that.$login_role_change.find('span').html(str)
            that.$login_role_bind.hide()
            that.$login_role_change.show()
          }
        }
      }

      //角色绑定
      storage.setItem('sy_role_info', info.role_info)

      //设置抽奖信息
      lottery_num = parseInt(info['num']) //次数
      lottery_address = info['isAdd'] //是否填写地址
      $('.lottery-num').find('span').html(info['num'])

      // 是否回归
      if (info.back_status == '1' && info.role_info != null && that.copyAcc != '') {
        that.getBackRole()
      }

      //是否第一次执行
      if (that.isFirst) {
        //是否第一次进入
        if (!info['isFirst']) {
          that.$dialog_packet.hide()

          $('body').toast({
            position: 'fixed',
            fontSize: '13px',
            content: '已获得本日免费抽奖机会~ <br/>分享闪烁分享卡可获得更多机会~',
            duration: 2000,
          })
        } else {
          that.$dialog_packet.hide()

          $('body').toast({
            position: 'fixed',
            fontSize: '13px',
            content: '您获得了一次抽奖机会~试试你的欧气吧~',
            duration: 2000,
          })
        }
      } else {
        that.$dialog_packet.hide()
      }
    },
    //获取账号抽奖次数信息
    getInfo: function (status) {
      var that = this,
        token = storage.getItem('sy_token'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally'),
        api_params = {}

      api_params['token'] = token
      api_params['type'] = 1

      if (is_ally) {
        api_params['token'] = 0
        api_params['type'] = 2
        api_params['mixAcc'] = mixAcc
      }

      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/info',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            //设置信息
            that.setInfo(response.data, status)
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.getInfo, that))
          } else {
            storage.removeItem('sy_acc')
            storage.removeItem('sy_mixAcc')
            storage.removeItem('sy_is_ally')
            storage.removeItem('sy_role_info')
            storage.removeItem('sy_token')
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            $('body').toast({
              position: 'fixed',
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //刷新Token
    refreshToken: function (token, callback) {
      var that = this,
        api_params = {}
      api_params['token'] = token
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.sdkapi_secret)

      $.ajax({
        url: that.config.sdkapi_web_url + '/web/token/refresh',
        type: 'post',
        data: api_params,
        success: function (response) {
          if (response.code == 0) {
            storage.setItem('sy_token', response.data.token)
            callback && callback()
          } else {
            console.log(response.message)
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            console.log('请求出错')
          }
        },
      })
    },
    //token登录
    loginToken: function (token) {
      var that = this,
        api_params = {}

      api_params['token'] = token
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.sdkapi_secret)

      $.ajax({
        url: that.config.sdkapi_web_url + '/web/token/loginToken',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            storage.removeItem('sy_mixAcc')
            storage.removeItem('sy_is_ally')

            storage.setItem('sy_acc', response.data, 10 * 60 * 60 * 1000)
            storage.setItem('sy_token', response.data.token)

            var opt = {
              token: response.data.token,
              copyAcc: that.copyAcc,
              mixAcc: that.mixAcc,
              type: 1, //官方
              is_back: '',
              step: 2,
            }

            that.buryLog(opt, function () {
              that.setAccInfo(response.data.account_id)
              that.$dialog_login.hide()
            })
          } else {
            $('body').toast({
              position: 'fixed',
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            $('body').toast({
              position: 'fixed',
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //联运登录
    loginCode: function (code) {
      var that = this,
        api_params = {}

      api_params['code'] = code
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.activity_secret)

      $.ajax({
        url: that.config.activityapi_url + '/towns/codeLogin',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            that.mixAcc = response.data.account_id

            storage.removeItem('sy_acc')
            storage.removeItem('sy_token')
            //联运账号id
            storage.setItem('sy_mixAcc', that.mixAcc, 10 * 60 * 60 * 1000)
            //设置来源是否是联运
            storage.setItem('sy_is_ally', true)

            var opt = {
              token: response.data.token,
              copyAcc: that.copyAcc,
              mixAcc: that.mixAcc,
              type: 2, //联运
              is_back: '',
              step: 2,
            }

            that.buryLog(opt, function () {
              that.setAccInfo(response.data.account_id, 2)
              that.$dialog_login.hide()
            })
          } else {
            $('body').toast({
              position: 'fixed',
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            $('body').toast({
              position: 'fixed',
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //提交登录
    loginWeb: function (api_params, login_url) {
      var that = this

      $.ajax({
        url: that.config.sdkapi_web_url + login_url,
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            storage.removeItem('sy_mixAcc')
            storage.removeItem('sy_is_ally')

            storage.setItem('sy_acc', response.data, 10 * 60 * 60 * 1000)
            storage.setItem('sy_token', response.data.token)

            var opt = {
              token: response.data.token,
              copyAcc: that.copyAcc,
              mixAcc: that.mixAcc,
              type: 1, //官方
              is_back: '',
              step: 2,
            }

            //登录成功打点
            that.buryLog(opt, function () {
              //设置账户信息
              that.setAccInfo(response.data.account_id, 1)
              //关闭登录弹窗
              that.$dialog_login.hide()
            })
          } else if (response.code == 1102) {
            that.$dialog_login.toast({
              content: '密码输入错误，非官方账号玩家请使用游戏验证登录',
              duration: 2000,
            })
          } else {
            that.$dialog_login.toast({
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            that.$dialog_login.toast({
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //登录
    loginSubmit: function (e) {
      var that = this,
        login_url = '/web/login',
        api_params = {},
        login_type = that.$dialog_login.find('.select-menu li.cur').attr('data-login_type')

      //账号密码登录
      if (login_type == '1') {
        login_url = '/web/login'

        api_params['phone_number'] = that.$dialog_login.find('input[name="username"]').val()
        api_params['password'] = that.$dialog_login.find('input[name="pwd"]').val()
        api_params['code'] = that.$dialog_login.find('input[name="captcha"]').val()

        if (api_params['phone_number'] == '') {
          that.$dialog_login.toast({
            content: '请输入手机号/账号~',
            duration: 3000,
          })
          return false
        }

        if (api_params['password'] == '') {
          that.$dialog_login.toast({
            content: '请输入密码~',
            duration: 3000,
          })
          return false
        }

        if (!/^[0-9a-zA-Z]{5}$/.test(api_params['code'])) {
          that.$dialog_login.toast({
            content: '请输入正确的验证码~',
            duration: 3000,
          })
          return false
        }

        api_params['ts'] = Math.round(new Date() / 1000)
        api_params['sign'] = sign(api_params, that.config.sdkapi_secret)

        that.loginWeb(api_params, login_url)
      } else if (login_type == '2') {
        //短信登录登录
        login_url = '/web/phoneLogin'
        api_params['phone_number'] = that.$dialog_login.find('input[name="phone"]').val()
        api_params['code'] = that.$dialog_login.find('input[name="code"]').val()

        if (api_params['phone_number'] == '' || !that.isPhone(api_params['phone_number'])) {
          that.$dialog_login.toast({
            content: '请输入11位手机号码~',
            duration: 2000,
          })
          return false
        }

        if (api_params['code'] == '') {
          that.$dialog_login.toast({
            content: '请输入短信验证码~',
            duration: 2000,
          })
          return false
        }

        if (!/^[0-9]{4}$/.test(api_params['code'])) {
          that.$dialog_login.toast({
            content: '请输入正确短信验证码~',
            duration: 2000,
          })
          return false
        }

        api_params['ts'] = Math.round(new Date() / 1000)
        api_params['sign'] = sign(api_params, that.config.sdkapi_secret)

        that.loginWeb(api_params, login_url)
      } else {
        //联运授权码登陆
        var code = that.$dialog_login.find('input[name="gcode"]').val()

        if (code == '') {
          that.$dialog_login.toast({
            content: '请输入游戏验证码~',
            duration: 2000,
          })
          return false
        }

        that.loginCode(code)
      }
    },
    //登出
    logout: function (e) {
      storage.removeItem('sy_acc')
      storage.removeItem('sy_mixAcc')
      storage.removeItem('sy_is_ally')
      storage.removeItem('sy_role_info')
      storage.removeItem('sy_token')
      window.location.href = this.config.base_url
    },
  })

  $(document).ready(function () {
    new App().init()
    // new App().start()
  })
})(jQuery)
