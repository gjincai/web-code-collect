;(function ($) {
  var lottery_num = 0 // 抽奖次数
  var lottery_id = 1 //奖品id
  var lottery_index = 1 //奖品序号
  var lottery_type = 1 //1虚拟 2实物
  var lottery_name = '' //奖品名称
  var lottery_open = false //是否正在抽奖
  var lottery_address = false //是否填写地址

  var App = function () {
    this.$btn_join = $('.btn-join')
    this.$login_start = $('.login-start')
    this.$login_after = $('.login-after')
    this.$login_role_bind = $('.login-role-bind')
    this.$login_role_change = $('.login-role-change')
    this.$login_prize = $('.login-prize')
    this.$login_rule = $('.login-rule')
    this.$tree = $('.tree')

    this.$lottery_start = $('.lottery-start')
    this.$btn_share = $('.btn-share')
    this.$share_qrcode = $('.share-qrcode')

    this.$dialog_packet = $('#J_dialog_packet')
    this.$dialog_login = $('#J_dialog_login')
    this.$dialog_share = $('#J_dialog_share')
    this.$dialog_my = $('#J_dialog_my')
    this.$dialog_lottery = $('#J_dialog_lottery')
    this.$dialog_address = $('#J_dialog_address')
    this.$dialog_bind = $('#J_dialog_bind')
    this.$dialog_loading = $('#J_dialog_loading')

    this.$device_select = $('.device-select') //选择平台
    this.$service_select = $('.service-select') //选择服务器
    this.$role_select = $('.role-select') //选择角色

    this.$btn_play = $('.btn-play')
    this.$pop_video = $('#J_pop_video')

    this.copyAcc = '' //分享账号Id
    this.mixAcc = '' //联运账号Id
    this.login_type = '1' //登录类型
    this.loot = null //抽奖
    this.sms_timer = null //倒计时
    this.isFirst = true //第一次
    this.is_ally = false //是否联运登录

    this.pla_id = '' //平台ID
    this.srv_id = '' //服务器ID
    this.role_id = '' //角色ID
    this.role_name = '' //角色名

    this.deviceSelect = null //平台
    this.serviceSelect = null //区服
    this.roleSelect = null //角色

    this.config = {
      project_id: '11',
      sdkapi_secret: 'SQz7RrTGbb0j7NCK',
      commonapi_secret: 'JZ0PJRVzpUctYExk',
      activity_secret: 'JZ0Psf67jc10U05cykVzpUctYExk',
      payapi_key: 'webpayqrcode',
      payapi_web_url: 'https://pay.shiyue.com',
      sdkapi_web_url: 'https://api.shiyue.com',
      commonapi_web_url: 'https://api-common.shiyue.com',
      activityapi_url: 'https://activity.shiyue.com',
      base_url: 'https://sszg.shiyue.com/m/towns.html',
    }

    /*     this.config = {
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
    } */
  }
  $.extend(App.prototype, {
    init: function () {
      this.initialize()
      this.bindEvent()
      this.copy()
      this.selectArea()
      this.swiperInit()
    },
    initialize: function () {
      var that = this,
        token = that.getQueryStr('token'), //获取游戏入口token
        code = that.getQueryStr('code'), //获取联运游戏入口code
        acc_id = that.getQueryStr('copyAcc'), //获取分享账号Id
        type = that.getQueryStr('type'), //分享来源类型
        sy_token = storage.getItem('sy_token'), //获取登录token
        sy_acc = storage.getItem('sy_acc'), //获取登录账号信息
        sy_mixAcc = storage.getItem('sy_mixAcc'), //获取联运登录账号id
        is_ally = storage.getItem('sy_is_ally') //获取是否联运

      if (acc_id != null) {
        that.copyAcc = acc_id //设置分享账号Id
        //联运分享进入 切换登录类型
        if (type == '2') {
          that.login_type = '3'
        }
      }

      //显示联动礼包弹窗
      that.$dialog_packet.show()

      //打点配置
      var opt = {
        token: '',
        copyAcc: that.copyAcc,
        mixAcc: '',
        type: 1,
        is_back: '',
        step: 1,
      }

      //游戏入口token自动登录
      if (token != null) {
        //打开活动页面打点
        that.buryLog(opt)

        that.loginToken(token)
      } else if (code != null) {
        //打开活动页面打点
        that.buryLog(opt)

        // 联运自动登录
        that.loginCode(code)
      } else {
        //已登录
        var isLogin = sy_acc != null || sy_mixAcc != null
        if (isLogin) {
          //联运登录
          if (is_ally) {
            that.mixAcc = sy_mixAcc
            opt.type = 2
            opt.mixAcc = sy_mixAcc

            that.setAccInfo(sy_mixAcc, 2)
          } else {
            opt.token = sy_token
            opt.type = 1

            that.setAccInfo(sy_acc['account_id'], 1)
          }

          //打开活动页面打点
          that.buryLog(opt)
        } else {
          //未登录
          that.$login_start.show()
          that.$login_after.hide()
          that.$login_role_bind.hide()
          that.$login_role_change.hide()
          that.$login_prize.hide()

          //打开活动页面打点
          that.buryLog(opt)
        }
      }

      //角色初始化
      that.selectInit()
    },
    bindEvent: function () {
      this.$btn_join.on('click', $.proxy(this.join, this))

      this.$login_start.on('click', $.proxy(this.loginPop, this))
      this.$login_after.on('click', $.proxy(this.logout, this))
      this.$login_prize.on('click', $.proxy(this.myPop, this))
      this.$login_role_bind.on('click', $.proxy(this.bindPop, this))
      this.$login_role_change.on('click', $.proxy(this.bindPop, this))

      this.$lottery_start.on('click', $.proxy(this.lottery, this))
      this.$btn_share.on('click', $.proxy(this.sharePop, this))

      this.$dialog_login.on('click', '.select-menu li', $.proxy(this.loginTab, this))
      this.$dialog_login.on('click', '.pic-captcha', $.proxy(this.refreshCaptcha, this))
      this.$dialog_login.on('click', '.login-submit', $.proxy(this.loginSubmit, this))
      this.$dialog_login.on('click', '.get-sms', $.proxy(this.getSms, this, this.$dialog_login, 'phone_login'))
      this.$dialog_address.on('click', '.btn-save', $.proxy(this.saveAddress, this))

      this.$dialog_packet.on('click', '.btn-red', $.proxy(this.redPacket, this))
      this.$dialog_packet.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_packet))

      this.$dialog_login.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_login))
      this.$dialog_lottery.on('click', '.btn-comfirm', $.proxy(this.addressPop, this))
      this.$dialog_lottery.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_lottery))
      this.$dialog_lottery.on('click', '.lottery-m a', $.proxy(this.myPop, this))
      this.$dialog_share.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_share))
      this.$dialog_my.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_my))
      this.$dialog_my.on('click', '.my-add', $.proxy(this.addPop, this))
      this.$dialog_my.on('click', '.receive', $.proxy(this.receive, this))
      this.$dialog_address.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_address))
      this.$dialog_bind.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_bind))
      this.$dialog_bind.on('click', '.btn-comfirm', $.proxy(this.updateRole, this))

      this.$tree.on('click', 'i', $.proxy(this.task, this))
      this.$login_rule.on('click', $.proxy(this.rule, this))

      this.$btn_play.on('click', $.proxy(this.videoPlay, this))
      this.$pop_video.on('click', '.close', $.proxy(this.videoClose, this))
    },
    getQueryStr: function (name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      var strs = window.location.search.substr(1)
      var jsonStr = Base64.decode(strs)
      var r = jsonStr.match(reg)
      if (r != null) {
        return decodeURIComponent(r[2])
      }
      return null
    },
    isPhone: function (str) {
      var phone_reg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])(\d{8}$)/
      if (phone_reg.test(str)) {
        return true
      } else {
        return false
      }
    },
    //设置登录信息
    setAccInfo: function (acc_id, type) {
      var that = this
      //登录成功获取信息
      that.getInfo('login')

      //登录成功生成二维码
      that.qrcodeInit(acc_id, type)
    },
    //立即抽奖
    join: function (e) {
      var top = $('.lottery-tips').offset().top - $('.header').height()
      $('html,body').animate({ scrollTop: top }, 700)
    },
    //红包登录抽奖
    redPacket: function (e) {
      var that = this,
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc')

      var isLogin = acc != null || mixAcc != null
      //判断是否登录
      if (!isLogin) {
        that.loginPop()
      } else {
        that.join()
      }

      that.$dialog_packet.hide()
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
    lotteryIdx: function (id) {
      var idx = ''
      switch (id) {
        case 1:
          idx = 1
          break
        case 2:
          idx = 9
          break
        case 3:
          idx = 10
          break
        case 4:
          idx = 6
          break
        case 5:
          idx = 11
          break
        case 6:
          idx = 4
          break
        case 7:
          idx = 7
          break
        case 8:
          idx = 3
          break
        case 9:
          idx = 8
          break
        case 10:
          idx = 5
          break
        case 11:
          idx = 0
          break
        case 12:
          idx = 2
          break
        default:
          idx = 1
      }

      return idx
    },
    //抽奖
    lottery: function (e) {
      var that = this,
        token = storage.getItem('sy_token'),
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally')

      var isLogin = acc != null || mixAcc != null
      //判断是否登录
      if (!isLogin) {
        that.loginPop()
        return false
      }

      //判断抽奖次数
      if (lottery_num <= 0) {
        $('body').toast({
          position: 'fixed',
          textAlign: 'center',
          content: '抽奖次数不足~',
          duration: 2000,
        })

        var top = $('.share-tips').offset().top - $('.header').height()
        $('html,body').animate({ scrollTop: top }, 700)

        return false
      }

      //防止连点
      if (lottery_open) return false
      lottery_open = !lottery_open

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
        url: that.config['activityapi_url'] + '/towns/luckDraw',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            lottery_num = parseInt(response.data.num) //获取次数
            lottery_id = parseInt(response.data.item_id) //获取序号
            lottery_type = parseInt(response.data.item_type) //是否实物
            lottery_name = response.data.item_name //奖品名称

            lottery_index = that.lotteryIdx(lottery_id)

            //抽奖
            that.lotteryStart(lottery_index, lottery_id, lottery_type, lottery_name)
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.lottery, that))
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
    //抽奖返回
    lotteryStart: function (idx, item_id, item_type, item_name) {
      var that = this,
        token = storage.getItem('sy_token'),
        is_ally = storage.getItem('sy_is_ally'),
        baseAngle = 360 / 12,
        angles = -baseAngle * idx

      $('.lottery-pan').stopRotate()
      $('.lottery-pan').rotate({
        angle: 0,
        animateTo: angles + 360 * 5,
        duration: 10000,
        callback: function () {
          //奖品类型（1=> 虚拟奖品 2=> 实物）
          if (item_type == 1) {
            that.$dialog_lottery.find('.lottery-top span').html(item_name)
            that.$dialog_lottery.find('.lottery-success2').hide()

            if (idx == 1) {
              // 再来一次
              that.$dialog_lottery.find('.lottery-mid').hide()
            } else {
              that.$dialog_lottery.find('.lottery-mid').show()
            }

            that.$dialog_lottery.find('.lottery-success1').show()
          } else {
            that.$dialog_lottery.find('.lottery-img').html('<img src="assets/zhj/images/prize/' + item_id + '.png" />')
            that.$dialog_lottery.find('.lottery-res span').html(item_name)
            that.$dialog_lottery.find('.lottery-success1').hide()
            that.$dialog_lottery.find('.lottery-success2').show()
          }
          //重新开启抽奖
          lottery_open = !lottery_open

          //显示抽奖成功弹窗
          that.$dialog_lottery.show()

          that.isFirst = false
          that.getInfo()

          var opt = {
            token: token,
            copyAcc: that.copyAcc,
            mixAcc: that.mixAcc,
            type: 1,
            is_back: '',
            step: 3,
          }

          if (is_ally) {
            opt.type = 2
          }

          //抽奖打点
          that.buryLog(opt)
        },
      })
    },
    //生成二维码
    qrcodeInit: function (acc_id, type) {
      var id = Base64.encode('copyAcc=' + acc_id + '&type=' + type)
      var url = this.config.base_url + '?' + id
      this.$share_qrcode.qrcode({
        width: 228,
        height: 228,
        text: url,
      })
    },
    getPixelRatio: function (context) {
      var backingStore =
        context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio ||
        1

      return (window.devicePixelRatio || 1) / backingStore
    },
    //绘制分享图片
    drawAndShareImage: function (imgBase64) {
      var that = this,
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        ratio = that.getPixelRatio(context)

      canvas.width = 545 * ratio
      canvas.height = 872 * ratio
      context.fillStyle = '#fff'
      context.rect(0, 0, canvas.width, canvas.height)

      var num = Math.floor(Math.random() * 7 + 1)
      var myImage = new Image()
      myImage.src = './assets/zhj/images/share/' + num + '.jpg'
      myImage.crossOrigin = 'Anonymous'

      myImage.onload = function () {
        context.drawImage(myImage, 0, 0, 545 * ratio, 872 * ratio)

        var myImage2 = new Image()
        myImage2.src = imgBase64
        myImage2.crossOrigin = 'Anonymous'

        myImage2.onload = function () {
          context.fillStyle = '#fff'
          context.rect(0, 0, canvas.width, canvas.height)
          context.drawImage(myImage2, 365 * ratio, 672 * ratio, 150 * ratio, 150 * ratio)
          var base64 = canvas.toDataURL('image/jpeg')
          that.$dialog_share.find('.share-card .download').attr('href', base64)
          that.$dialog_share.find('.share-card img').attr('src', base64)
          that.$dialog_loading.hide()
          that.$dialog_share.show()
        }
      }
    },
    //分享弹窗
    sharePop: function (e) {
      var that = this,
        token = storage.getItem('sy_token'),
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally')

      var isLogin = acc != null || mixAcc != null
      //判断是否登录
      if (!isLogin) {
        that.loginPop()
        return false
      }

      var opt = {
        token: token,
        copyAcc: that.copyAcc,
        mixAcc: '',
        type: 1,
        is_back: '',
        step: 4,
      }

      if (is_ally) {
        opt.type = 2
        opt.mixAcc = mixAcc
      }

      that.buryLog(opt, function () {
        that.isFirst = false
        that.getInfo()
      })

      that.$dialog_loading.show()

      var dataURL = this.$share_qrcode.find('canvas')[0].toDataURL()
      this.drawAndShareImage(dataURL)
    },
    //绑定角色弹窗
    bindPop: function () {
      var that = this
      that.getPlatforms(that.config.project_id)
      that.$dialog_bind.show()
    },
    //角色选择
    selectInit: function () {
      var that = this

      // 平台
      that.deviceSelect = new MobileSelect({
        trigger: '.device-select',
        title: '请选择平台',
        wheels: [
          {
            data: [{ id: '', name: '暂无平台' }],
          },
        ],
        keyMap: { id: 'id', value: 'name' },
        callback: function (indexArr, data) {
          that.srv_id = ''
          that.$service_select.html('<span>请选择区服</span>')
          that.role_id = ''
          that.role_name = ''
          that.$role_select.html('<span>请选择角色</span>')

          that.pla_id = data[0]['id'] || ''
          if (that.pla_id == '') return false
          //获取区服
          that.getServers(that.pla_id)
        },
      })

      // 区服
      that.serviceSelect = new MobileSelect({
        trigger: '.service-select',
        title: '请选择区服',
        wheels: [
          {
            data: [{ server_id: '', server_name: '暂无区服' }],
          },
        ],
        keyMap: { id: 'server_id', value: 'server_name' },
        callback: function (indexArr, data) {
          that.role_id = ''
          that.role_name = ''
          that.$role_select.html('<span>请选择角色</span>')
          that.srv_id = data[0]['server_id'] || ''

          if (that.srv_id == '') return false
          //获取角色
          that.getRole(that.srv_id)
        },
      })

      // 角色
      that.roleSelect = new MobileSelect({
        trigger: '.role-select',
        title: '请选择角色',
        wheels: [
          {
            data: [{ role_id: '', role_name: '暂无角色' }],
          },
        ],
        keyMap: { id: 'role_id', value: 'role_name' },
        callback: function (indexArr, data) {
          that.role_id = data[0]['role_id']
          that.role_name = data[0]['role_name']
        },
      })
    },
    //获取平台列表
    getPlatforms: function (project_id) {
      var that = this,
        api_params = {}

      api_params['project_id'] = project_id
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.payapi_key)

      $.ajax({
        url: that.config.payapi_web_url + '/webPay/platforms',
        type: 'post',
        data: api_params,
        success: function (response) {
          if (response.code == 0) {
            if (response.data.length != 0) {
              that.deviceSelect.updateWheel(0, response.data)
            } else {
              $('body').toast({
                position: 'fixed',
                content: '获取平台失败，请稍候再试~',
                duration: 2000,
              })
            }
          } else {
            $('body').toast({
              position: 'fixed',
              content: '获取平台失败，请稍候再试~',
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
    //获取区服列表
    getServers: function (platform) {
      var that = this,
        acc = storage.getItem('sy_acc')
      api_params = {}

      if (acc == null) {
        that.loginPop()
        return false
      }

      api_params['name'] = acc['name']
      api_params['project_id'] = that.config.project_id
      api_params['platform'] = platform
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.commonapi_secret)

      $.ajax({
        url: that.config.commonapi_web_url + '/project/getOwnServers',
        type: 'post',
        data: api_params,
        success: function (response) {
          if (response.code == 0) {
            if (response.data.length != 0) {
              that.serviceSelect.updateWheel(0, response.data)
            } else {
              $('body').toast({
                position: 'fixed',
                content: '暂无玩过的区服，请重新选择',
                duration: 2000,
              })
            }
          } else {
            $('body').toast({
              position: 'fixed',
              content: '获取区服失败，请稍候再试~',
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
    //获取角色列表
    getRole: function (server_id) {
      var that = this,
        token = storage.getItem('sy_token')
      acc = storage.getItem('sy_acc')
      api_params = {}

      api_params['project_id'] = that.config.project_id
      api_params['server_id'] = server_id
      api_params['name'] = acc['name']
      api_params['token'] = token
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.commonapi_secret)

      $.ajax({
        url: that.config.commonapi_web_url + '/project/getRole',
        type: 'post',
        data: api_params,
        success: function (response) {
          if (response.code == 0 && response.data.length != 0) {
            that.roleSelect.updateWheel(0, response.data)
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.getRole, that, server_id))
          } else {
            $('body').toast({
              position: 'fixed',
              content: '获取角色失败，请重新选择',
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
    bindRole: function (role_info) {
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

      api_params['zone_id'] = role_info['zone_id']
      api_params['platform'] = role_info['platform']
      api_params['server_name'] = role_info['server_name']
      api_params['role_id'] = role_info['role_id']
      api_params['role_name'] = role_info['role_name']
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/editRole',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            that.isFirst = false
            that.getInfo()

            that.$dialog_bind.hide()
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.bindRole, that))
          } else {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //获取回归玩家状态
    getBackRole: function () {
      var that = this,
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc'),
        api_params = {}

      api_params['copyAcc'] = that.copyAcc
      if (acc != null) {
        api_params['account_id'] = acc['account_id']
      } else if (mixAcc != null) {
        api_params['account_id'] = mixAcc
      }

      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/backNo',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            that.backRole(response.data)
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
    //回归玩家状态更新
    backRole: function (data) {
      var that = this,
        token = storage.getItem('sy_token'),
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc'),
        role_info = storage.getItem('sy_role_info'),
        api_params = {}

      api_params['role_id'] = role_info['role_id']
      api_params['platform'] = role_info['platform']
      api_params['zone_id'] = role_info['zone_id']

      if (acc != null) {
        api_params['account_id'] = acc['account_id']
      } else if (mixAcc != null) {
        api_params['account_id'] = mixAcc
      }

      api_params['back_acc'] = data['back_acc']
      api_params['back_no'] = data['back_card']
      api_params['ctime'] = data['ctime']
      api_params['flag'] = data['flag']
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: 'https://weekly-sszg.shiyuegame.com/api.php/pf/towns/back',
        data: api_params,
        type: 'get',
        success: function (response) {
          var res = JSON.parse(response)
          if (res.error == 666) {
            var opt = {
              token: token,
              copyAcc: that.copyAcc,
              mixAcc: mixAcc,
              type: 1,
              is_back: '',
              step: 5,
            }

            if (mixAcc != null) {
              opt.type = 2
            }

            //回归打点
            that.buryLog(opt)
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
    //角色更新
    updateRole: function () {
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

      if (that.pla_id == '') {
        that.$dialog_bind.toast({
          position: 'fixed',
          textAlign: 'center',
          content: '请选择您的平台~',
          duration: 2000,
        })
        return false
      }

      if (that.srv_id == '') {
        that.$dialog_bind.toast({
          position: 'fixed',
          textAlign: 'center',
          content: '请选择您的区服~',
          duration: 2000,
        })
        return false
      }

      if (that.role_id == '') {
        that.$dialog_bind.toast({
          position: 'fixed',
          textAlign: 'center',
          content: '请选择您的角色~',
          duration: 2000,
        })
        return false
      }

      var s_data = that.serviceSelect.getValue()
      var s_arr = s_data[0]['server_id'].split('_')

      api_params['platform'] = s_arr[0]
      api_params['zone_id'] = s_arr[1]
      api_params['server_name'] = s_data[0]['server_name']

      var r_data = that.roleSelect.getValue()
      api_params['role_id'] = r_data[0]['role_id']
      api_params['role_name'] = r_data[0]['role_name']

      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/editRole',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '角色绑定成功~',
              duration: 2000,
            })

            that.isFirst = false
            that.getInfo('login')

            that.$dialog_bind.hide()
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.updateRole, that))
          } else {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //抽奖收获地址
    addressPop: function (e) {
      this.$dialog_lottery.hide()

      if (lottery_address && lottery_type == 2) {
        this.$dialog_address.show()
      } else {
        this.$dialog_address.hide()
      }
    },
    //更新收获地址
    addPop: function (e) {
      this.$dialog_my.hide()

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
            if (response.data.isAdd) {
              that.$dialog_address.find('input[name="name"]').val('')
              that.$dialog_address.find('input[name="phone"]').val('')
              that.$dialog_address.find('.area').html('<span>请选择地区</span>')
              that.$dialog_address.find('input[name="address"]').val('')
              that.$dialog_address.find('.area').show()
              that.$dialog_address.find('.btn-save').show()
            } else {
              that.$dialog_address.find('input[name="name"]').val(response.data.name)
              that.$dialog_address.find('input[name="phone"]').val(response.data.contact)
              that.$dialog_address.find('input[name="address"]').val(response.data.address)
              that.$dialog_address.find('.area').hide()
              that.$dialog_address.find('.btn-save').hide()
            }

            that.$dialog_address.show()
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.getInfo, that))
          } else {
            that.$dialog_address.find('input[name="name"]').val('')
            that.$dialog_address.find('input[name="phone"]').val('')
            that.$dialog_address.find('.area').html('<span>请选择地区</span>')
            that.$dialog_address.find('input[name="address"]').val('')
            that.$dialog_address.find('.area').show()
            that.$dialog_address.find('.btn-save').show()
            that.$dialog_address.show()
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
    //选择地区
    selectArea: function () {
      new MobileSelect({
        trigger: '#triggerCity',
        title: '地区选择',
        wheels: [{ data: cityData }],
        callback: function (indexArr, data) {
          console.log(data)
        },
      })
    },
    //存储地址
    saveAddress: function (e) {
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

      api_params['name'] = that.$dialog_address.find('input[name="name"]').val()
      api_params['contact'] = that.$dialog_address.find('input[name="phone"]').val()
      api_params['city'] = that.$dialog_address.find('.area').html()
      api_params['address'] = that.$dialog_address.find('input[name="address"]').val()

      if (api_params['name'] == '') {
        that.$dialog_address.toast({
          textAlign: 'center',
          content: '请输入真实姓名~',
          duration: 2000,
        })
        return false
      }

      if (api_params['contact'] == '' || !that.isPhone(api_params['contact'])) {
        that.$dialog_address.toast({
          textAlign: 'center',
          content: '请输入11位手机号码~',
          duration: 2000,
        })
        return false
      }

      if (api_params['city'] == '<span>请选择地区</span>') {
        that.$dialog_address.toast({
          textAlign: 'center',
          content: '请选择地区~',
          duration: 2000,
        })
        return false
      }

      if (api_params['address'] == '') {
        that.$dialog_address.toast({
          textAlign: 'center',
          content: '请输入详细地址~',
          duration: 2000,
        })
        return false
      }

      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/editInfo',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            that.$dialog_address.toast({
              textAlign: 'center',
              content: '收获地址修改成功~',
              duration: 2000,
            })

            that.isFirst = false
            that.getInfo()

            that.$dialog_address.hide()
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.saveAddress, that))
          } else {
            that.$dialog_address.toast({
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            that.$dialog_address.toast({
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //领取奖品
    receive: function (e) {
      var e = e || window.event,
        current = e.currentTarget,
        that = this,
        api_params = {},
        is_receive = $(current).hasClass('is_receive'),
        role_info = storage.getItem('sy_role_info')

      if (is_receive) {
        return false
      }

      if (!role_info) {
        that.$dialog_my.hide()
        // that.$dialog_bind.show()
        that.bindPop()

        $('body').toast({
          position: 'fixed',
          textAlign: 'center',
          content: '请先完成角色绑定~',
          duration: 2000,
        })

        return false
      }

      var role_id = role_info['role_id'],
        platform = role_info['platform'],
        zone_id = role_info['zone_id'],
        account_id = $(current).attr('data-account_id'),
        card_id = $(current).attr('data-card_id'),
        card_no = $(current).attr('data-card_no'),
        ctime = $(current).attr('data-ctime'),
        flag = $(current).attr('data-flag')

      api_params['role_id'] = role_id
      api_params['platform'] = platform
      api_params['zone_id'] = zone_id
      api_params['account_id'] = account_id
      api_params['card_id'] = card_id
      api_params['card_no'] = card_no
      api_params['ctime'] = ctime
      api_params['flag'] = flag
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: 'https://weekly-sszg.shiyuegame.com/api.php/pf/towns/gift',
        data: api_params,
        type: 'get',
        success: function (response) {
          var res = JSON.parse(response)
          if (res.error == 666) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '领取成功，预计24小时内发到绑定角色上~',
              duration: 2000,
            })

            var str = '已发给' + role_info['server_name'] + '-' + role_info['role_name']
            $(current).html(str)
            $(current).addClass('is_receive')

            // 更新礼包码状态
            that.editGift(card_no)
          } else {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: res.msg,
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
    //更新礼包码状态
    editGift: function (card_no) {
      var that = this,
        token = storage.getItem('sy_token'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally'),
        role_info = storage.getItem('sy_role_info'),
        api_params = {}

      api_params['token'] = token
      api_params['type'] = 1

      if (is_ally) {
        api_params['token'] = 0
        api_params['type'] = 2
        api_params['mixAcc'] = mixAcc
      }

      api_params['card_no'] = card_no
      api_params['role_name'] = role_info['role_name']
      api_params['server_name'] = role_info['server_name']
      api_params['role_id'] = role_info['role_id']
      api_params['platform'] = role_info['platform']
      api_params['zone_id'] = role_info['zone_id']
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/editGift',
        data: api_params,
        type: 'post',
        success: function (response) {},
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
    timeDuring: function (timestamp) {
      var date = new Date(timestamp * 1000)
      var Y = date.getFullYear() + '-'
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      return Y + M + D
    },
    //渲染奖品列表
    renderMy: function (data) {
      var that = this,
        time = ''

      var html = '<li>'
      html += '<div class="e1">奖品名称</div>'
      html += '<div class="e2">获取时间</div>'
      html += '<div class="e3">奖品内容</div>'
      html += '</li>'

      for (var i = 0, len = data.length; i < len; i++) {
        time = data[i]['time'].split(' ')[0]

        html += '<li>'
        html += '<div class="e1">' + data[i]['name'] + '</div>'
        html += '<div class="e2">' + time + '</div>'

        if (data[i]['name'] == '再来一次' || parseInt(data[i]['item_type']) == 2) {
          html += '<div class="e3"></div>'
        } else if (data[i]['role_info'] != null) {
          html += '<div class="e3">已发给' + data[i]['role_info']['server_name'] + '-' + data[i]['role_info']['role_name'] + '</div>'
        } else {
          html +=
            '<div class="e3 receive" data-account_id = "' +
            data[i]['account_id'] +
            '" data-card_id="' +
            data[i]['card_id'] +
            '" data-card_no="' +
            data[i]['card_no'] +
            '" data-ctime="' +
            data[i]['ctime'] +
            '" data-flag="' +
            data[i]['flag'] +
            '"><a href="javascript:;">领取</a></div>'
          html += '</li>'
        }
      }

      that.$dialog_my.find('.my-box').html(html)
      that.$dialog_my.show()
    },
    //我的奖品
    myPop: function (e) {
      //关闭抽奖弹窗
      this.$dialog_lottery.hide()

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
        url: that.config['activityapi_url'] + '/towns/optInfo',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0 && response.data.length != 0) {
            that.renderMy(response.data)
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.myPop, that))
          } else {
            that.$dialog_my.find('.my-box').html('暂无记录~')
            that.$dialog_my.show()
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            that.$dialog_my.toast({
              content: '系统繁忙，请稍候再试~',
              duration: 2000,
            })
          }
        },
      })
    },
    //关闭弹窗
    closePop: function (obj) {
      obj.hide()
    },
    //日志
    buryLog: function (opt, callback) {
      var that = this,
        api_params = {}
      api_params['token'] = opt['token'] || ''
      api_params['copyAcc'] = opt['copyAcc'] || ''
      api_params['mixAcc'] = opt['mixAcc'] || ''
      api_params['type'] = opt['type'] || '1'
      api_params['is_back'] = opt['is_back'] || ''
      api_params['step'] = opt['step']
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/towns/log',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            callback && callback(response.data)
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            console.log('埋点请求出错')
          }
        },
      })
    },
    copy: function () {
      var that = this,
        clipboard = new ClipboardJS('.copy')
      //success
      clipboard.on('success', function (e) {
        $('body').toast({
          position: 'fixed',
          textAlign: 'center',
          content: '复制成功~',
          duration: 2000,
        })
      })
      //error
      clipboard.on('error', function (e) {
        $('body').toast({
          position: 'fixed',
          textAlign: 'center',
          content: '复制失败~',
          duration: 2000,
        })
        console.log(e)
      })
    },
    //轮播
    swiperInit: function () {
      new Swiper('.gift-swiper', {
        autoplay: true,
        loop: true,
        centeredSlides: true,
        slidesPerView: 3,
        navigation: {
          nextEl: '.gift-next',
          prevEl: '.gift-prev',
        },
        pagination: {
          el: '.swiper-pagination-gift',
          clickable: true,
        },
      })

      new Swiper('.feature-swiper', {
        pagination: {
          el: '.swiper-pagination-feature',
          clickable: true,
        },
        parallax: true,
        loop: true,
        speed: 300,
        centeredSlides: true,
        slidesPerView: 'auto',
        autoplay: {
          disableOnInteraction: false,
          delay: 3000,
        },
        effect: 'coverflow',
        coverflowEffect: {
          rotate: 0,
          stretch: 254,
          depth: 200,
          modifier: 1,
          slideShadows: true,
        },
      })
    },
    task: function (e) {
      var top = $('.page4 .title').offset().top - $('.header').height()
      $('html,body').animate({ scrollTop: top }, 700)
    },
    rule: function (e) {
      var top = $('.page5 .top').offset().top - $('.header').height()
      $('html,body').animate({ scrollTop: top }, 700)
    },
    videoPlay: function (e) {
      var e = e || window.event,
        current = e.currentTarget,
        that = this,
        timer = null,
        poster_url = $(current).attr('data-poster'),
        video_url = $(current).attr('data-video')

      clearTimeout(timer)

      that.$pop_video.find('video').attr({
        poster: poster_url,
        src: video_url,
      })

      timer = setTimeout(function () {
        that.$pop_video.find('video')[0].currentTime = 0
        that.$pop_video.find('video')[0].play()
      }, 100)

      that.$pop_video.show()
    },
    videoClose: function (e) {
      this.$pop_video.hide()
      this.$pop_video.find('video')[0].pause()
    },
  })

  $(document).ready(function () {
    new App().init()
  })
})(jQuery)
