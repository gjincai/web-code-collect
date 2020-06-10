;(function ($) {
  var lottery_num = 0 // 抽奖次数
  var lottery_id = 1 //奖品id
  var lottery_index = 1 //奖品序号
  var lottery_type = 1 //1虚拟 2实物
  var lottery_name = '' //奖品名称
  var lottery_open = false //是否正在抽奖
  var lottery_address = false //是否填写地址
  var is_complete = '0' //是否合成五卡
  var need_card_num = 5 //还差多少张卡片集齐五元素卡

  var App = function () {
    this.$btn_join = $('.btn-join')
    this.$login_start = $('.login-start')
    this.$login_after = $('.login-after')
    this.$login_role_bind = $('.login-role-bind')
    this.$login_role_change = $('.login-role-change')
    this.$login_prize = $('.login-prize')
    this.$login_rule = $('.login-rule')
    this.$task = $('.lottery-task')

    this.$lottery_start = $('#J_lottery_start') //抽奖
    this.$select_card = $('.J_select_card') //选择卡牌
    this.$share_qrcode = $('.share-qrcode') //分享二维码

    this.$btn_merge = $('.btn-merge') //合成
    this.$btn_send = $('.btn-send') //送给好友

    this.$dialog_login = $('#J_dialog_login') //登录弹窗
    this.$dialog_lottery = $('#J_dialog_lottery') //抽奖弹窗
    this.$dialog_send = $('#J_dialog_send') //卡牌分享赠送
    this.$dialog_select = $('#J_dialog_select') //选择卡牌赠送
    this.$dialog_share = $('#J_dialog_share') //分享弹窗
    this.$dialog_rare = $('#J_dialog_rare') //稀有卡牌弹窗
    this.$dialog_my = $('#J_dialog_my') //我的奖品
    this.$dialog_address = $('#J_dialog_address') //地址填写弹窗
    this.$dialog_bind = $('#J_dialog_bind') //角色绑定弹窗
    this.$dialog_packet = $('#J_dialog_packet') //分享卡弹窗
    this.$dialog_loading = $('#J_dialog_loading') //loading

    this.$device_select = $('.device-select') //选择平台
    this.$service_select = $('.service-select') //选择服务器
    this.$role_select = $('.role-select') //选择角色

    this.copyAcc = '' //分享账号Id
    this.cardId = '' //分享卡牌id
    this.cardCode = '' //分享卡牌code
    this.mixAcc = '' //联运账号Id
    this.login_type = '1' //登录类型
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
    //   base_url: 'https://sszg.shiyue.com/m/anniversary.html',
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
      base_url: 'http://test-cms-sszg.shiyue.com/m/anniversary.html',
    }
  }
  $.extend(App.prototype, {
    init: function () {
      this.initialize()
      this.bindEvent()
      this.slideInit()
      this.swiperInit()
      this.selectArea()
      this.copy()
    },
    initialize: function () {
      var that = this,
        token = that.getQueryStr('token'), //获取游戏入口token
        code = that.getQueryStr('code'), //获取联运游戏入口code
        acc_id = that.getQueryStr('copyAcc'), //获取分享账号Id
        type = that.getQueryStr('type'), //分享来源类型
        cardId = that.getQueryStr('cardId'), //分享卡牌id
        cardCode = that.getQueryStr('cardCode'), //分享卡牌code
        sy_token = storage.getItem('sy_token'), //获取存储登录token
        sy_acc = storage.getItem('sy_acc'), //获取存储登录账号信息
        sy_mixAcc = storage.getItem('sy_mixAcc'), //获取存储联运登录账号id
        is_ally = storage.getItem('sy_is_ally') //获取存储是否为联运登录类型

      //登录状态
      var isLogin = sy_acc != null || sy_mixAcc != null

      if (acc_id != null) {
        that.copyAcc = acc_id //设置分享账号Id
        that.cardId = cardId //设置分享卡牌id
        that.cardCode = cardCode //设置分享码

        //显示分享卡领取弹窗
        var card_info = that.lotteryCard(parseInt(cardId)),
          card_name = card_info['type'],
          card_img = card_info['img']

        that.$dialog_packet.find('.lottery-res span').html(card_name)
        that.$dialog_packet.find('.lottery-card').html(card_img)

        if (isLogin) {
          that.$dialog_packet.find('.btn-accept').addClass('is-login')
        } else {
          that.$dialog_packet.find('.btn-accept').removeClass('is-login')
        }

        that.$dialog_packet.show() //分享卡弹窗

        //联运分享进入 切换到联运登录
        if (type == '2') {
          that.login_type = '3'
        }
      }

      //打点配置
      var opt = {
        token: '',
        copyAcc: that.copyAcc,
        mixAcc: '',
        type: 1,
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
        //登录状态判断
        if (isLogin) {
          //联运登录
          if (is_ally) {
            that.mixAcc = sy_mixAcc
            opt.type = 2
            opt.mixAcc = sy_mixAcc

            that.setAccInfo()
          } else {
            opt.token = sy_token
            opt.type = 1

            that.setAccInfo()
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
      this.$dialog_bind.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_bind))
      this.$dialog_bind.on('click', '.btn-comfirm', $.proxy(this.updateRole, this))

      this.$dialog_login.on('click', '.select-menu li', $.proxy(this.loginTab, this))
      this.$dialog_login.on('click', '.pic-captcha', $.proxy(this.refreshCaptcha, this))
      this.$dialog_login.on('click', '.login-submit', $.proxy(this.loginSubmit, this))
      this.$dialog_login.on('click', '.get-sms', $.proxy(this.getSms, this, this.$dialog_login, 'phone_login'))
      this.$dialog_login.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_login))

      // 抽奖
      this.$lottery_start.on('click', 'li', $.proxy(this.lottery, this))
      this.$dialog_lottery.on('click', '.lottery-mid a', $.proxy(this.myPop, this))
      this.$dialog_lottery.on('click', '.btn-comfirm', $.proxy(this.myPop, this))
      this.$dialog_lottery.on('click', '.btn-receive', $.proxy(this.addressPop, this))
      this.$dialog_lottery.on('click', '.btn-gather', $.proxy(this.gatherPop, this))
      this.$dialog_lottery.on('click', '.btn-rare', $.proxy(this.rarePop, this))
      this.$dialog_lottery.on('click', '.btn-back1', $.proxy(this.closePop, this, this.$dialog_lottery))

      this.$dialog_lottery.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_lottery))

      //卡牌选择
      this.$select_card.on('click', 'li', $.proxy(this.selectCard, this))
      this.$dialog_send.on('click', '.btn-back2', $.proxy(this.closePop, this, this.$dialog_send))
      this.$dialog_send.on('click', '.btn-share', $.proxy(this.sharePop, this))
      this.$dialog_share.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_share))

      //瓜分奖品
      this.$dialog_rare.on('click', '.btn-open', $.proxy(this.divide, this))
      this.$dialog_rare.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_rare))

      // 合成开牌
      this.$btn_merge.on('click', $.proxy(this.merge, this))

      // 送给好友
      this.$btn_send.on('click', $.proxy(this.send, this))
      this.$dialog_select.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_select))

      // 我的奖品
      this.$dialog_my.on('click', '.my-add', $.proxy(this.addPop, this))
      this.$dialog_my.on('click', '.receive', $.proxy(this.receive, this))
      this.$dialog_my.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_my))

      // 填写地址
      this.$dialog_address.on('click', '.btn-save', $.proxy(this.saveAddress, this))
      this.$dialog_address.on('click', '.dialog-close', $.proxy(this.closePop, this, this.$dialog_address))

      // 分享卡领取
      this.$dialog_packet.on('click', '.btn-accept', $.proxy(this.getShareCard, this))

      this.$task.on('click', $.proxy(this.task, this))
      this.$login_rule.on('click', $.proxy(this.rule, this))
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
    //立即集卡
    join: function (e) {
      //判断是否登录
      if (!this.isLogin()) {
        return false
      }

      var top = $('.lottery-tips').offset().top - $('.header').height()
      $('html,body').animate({ scrollTop: top }, 700)
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
    //登录成功请求用户信息
    setAccInfo: function () {
      var that = this

      if (that.copyAcc) {
        //分享卡牌获取
        that.getShareCard()
      } else {
        //登录成功获取用户信息
        that.getInfo('login')
      }
    },
    //设置卡牌信息
    renderCard: function (card) {
      var that = this

      if (card['card_1']['num'] > 0) {
        that.$select_card.find('.card-item1').addClass('show')
        that.$select_card.find('.card-item1').attr('data-num', card['card_1']['num'])
        that.$select_card.find('.card-item1 .num').html(card['card_1']['num'])
      }

      if (card['card_2']['num'] > 0) {
        that.$select_card.find('.card-item2').addClass('show')
        that.$select_card.find('.card-item2').attr('data-num', card['card_2']['num'])
        that.$select_card.find('.card-item2 .num').html(card['card_2']['num'])
      }

      if (card['card_3']['num'] > 0) {
        that.$select_card.find('.card-item3').addClass('show')
        that.$select_card.find('.card-item3').attr('data-num', card['card_3']['num'])
        that.$select_card.find('.card-item3 .num').html(card['card_3']['num'])
      }

      if (card['card_4']['num'] > 0) {
        that.$select_card.find('.card-item4').addClass('show')
        that.$select_card.find('.card-item4').attr('data-num', card['card_4']['num'])
        that.$select_card.find('.card-item4 .num').html(card['card_4']['num'])
      }

      if (card['card_5']['num'] > 0) {
        that.$select_card.find('.card-item5').addClass('show')
        that.$select_card.find('.card-item5').attr('data-num', card['card_5']['num'])
        that.$select_card.find('.card-item5 .num').html(card['card_5']['num'])
      }
    },
    //设置用户信息
    setInfo: function (info, status) {
      var that = this

      that.$login_start.hide() //登录前
      that.$login_after.show() //登录后
      that.$login_prize.show() //我的奖品

      // 联运登录类型
      if (info.acc_type == '2') {
        var str = info.role_info['server_name'] + '-' + info.role_info['role_name']
        that.$login_after.find('span').html(str)
      } else {
        // 账号登录类型
        var acc = storage.getItem('sy_acc')
        var name = acc['phone_number'] == '' ? acc['name'] : acc['phone_number']
        that.$login_after.find('span').html(name)

        if (status == 'login') {
          if (info.role_info == null) {
            that.$login_role_change.hide()
            that.$login_role_bind.show()

            //显示绑定角色弹窗
            // that.bindPop()
          } else {
            var str = info.role_info['server_name'] + '-' + info.role_info['role_name']
            that.$login_role_change.find('span').html(str)
            that.$login_role_bind.hide()
            that.$login_role_change.show()
          }
        }
      }

      //设置抽奖信息
      lottery_num = parseInt(info['num']) //剩余抽奖次数
      lottery_address = parseInt(info['is_commit_address']) //是否填写地址
      need_card_num = parseInt(info['need_card_num']) //还差多少张卡片集齐五元素卡
      is_complete = info['is_success'] //	是否合成五卡
      $('.lottery-num').find('span').html(info['num'])

      //是否显示合成卡
      if (is_complete == '1') {
        that.$select_card.find('.card-item0').addClass('show').removeClass('hide')
      } else {
        that.$select_card.find('.card-item0').addClass('hide').removeClass('show')
      }

      //渲染卡牌信息
      this.renderCard(info)

      //角色绑定信息
      storage.setItem('sy_role_info', info.role_info)

      // 是否回归
      if (info.back_status == '1' && info.role_info != null && that.copyAcc != '') {
        that.getBackRole()
      }

      //是否第一次执行
      if (that.isFirst) {
        var back_card = parseInt(info['get_back_card'])
        if (back_card == 4 || back_card == 5 || back_card == 6 || back_card == 7 || back_card == 8) {
          var tips = that.lotteryCard(back_card)
          $('body').toast({
            position: 'fixed',
            fontSize: '13px',
            textAlign: 'center',
            content: '你邀请的玩家已回归，' + tips['type'] + '卡已发放~',
            duration: 2000,
          })
        } else if (!info['is_first']) {
          //是否第一次进入
          $('body').toast({
            position: 'fixed',
            fontSize: '13px',
            textAlign: 'center',
            content: '已获得本日免费抽奖机会, 快来参与任务获得更多机会吧~',
            duration: 2000,
          })
        } else {
          //第一次进入
          $('body').toast({
            position: 'fixed',
            fontSize: '13px',
            textAlign: 'center',
            content: '您获得了一次抽卡机会，快来试试你的欧气吧',
            duration: 2000,
          })
        }
      }
    },
    //获取账号信息及抽奖信息
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
        url: that.config['activityapi_url'] + '/anniversary/main',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            //设置信息
            that.setInfo(response.data, status)
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.getInfo, that, status))
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
              textAlign: 'center',
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
              step: 2,
            }

            that.buryLog(opt, function () {
              that.setAccInfo()
              that.$dialog_login.hide()
            })
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
    //联运登录
    loginCode: function (code) {
      var that = this,
        api_params = {}

      api_params['code'] = code
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config.activity_secret)

      $.ajax({
        url: that.config.activityapi_url + '/anniversary/codeLogin',
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
            storage.setItem('sy_is_ally', true, 10 * 60 * 60 * 1000)

            var opt = {
              token: '',
              copyAcc: that.copyAcc,
              mixAcc: that.mixAcc,
              type: 2, //联运
              step: 2,
            }

            that.buryLog(opt, function () {
              that.setAccInfo()
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
              textAlign: 'center',
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
              step: 2,
            }

            //登录成功打点
            that.buryLog(opt, function () {
              //设置账户信息
              that.setAccInfo()
              //关闭登录弹窗
              that.$dialog_login.hide()
            })
          } else if (response.code == 1102) {
            that.$dialog_login.toast({
              textAlign: 'center',
              content: '密码输入错误，非官方账号玩家请使用游戏验证登录',
              duration: 2000,
            })
          } else {
            that.$dialog_login.toast({
              content: response.message,
              textAlign: 'center',
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            that.$dialog_login.toast({
              textAlign: 'center',
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
            textAlign: 'center',
            content: '请输入手机号/账号~',
            duration: 3000,
          })
          return false
        }

        if (api_params['password'] == '') {
          that.$dialog_login.toast({
            textAlign: 'center',
            content: '请输入密码~',
            duration: 3000,
          })
          return false
        }

        if (!/^[0-9a-zA-Z]{5}$/.test(api_params['code'])) {
          that.$dialog_login.toast({
            textAlign: 'center',
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
            textAlign: 'center',
            content: '请输入11位手机号码~',
            duration: 2000,
          })
          return false
        }

        if (api_params['code'] == '') {
          that.$dialog_login.toast({
            textAlign: 'center',
            content: '请输入短信验证码~',
            duration: 2000,
          })
          return false
        }

        if (!/^[0-9]{4}$/.test(api_params['code'])) {
          that.$dialog_login.toast({
            textAlign: 'center',
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
            textAlign: 'center',
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
    //是否已经登录
    isLogin: function () {
      var that = this,
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc')

      var isLogin = acc != null || mixAcc != null
      //判断是否登录
      if (!isLogin) {
        that.loginPop()
        return false
      } else {
        return true
      }
    },
    //是否活动截止
    actEnd: function (endStr) {
      var curTime = Date.now()
      var endTime = new Date(endStr).getTime()

      if (curTime - endTime >= 0) {
        return true
      } else {
        return false
      }
    },
    lotteryCard: function (id) {
      var card_info = {
        img: '',
        title: '',
        type: '',
      }
      switch (id) {
        case 4:
          card_info = {
            img: '<img src="assets/jk/images/card/card1.png" />',
            title: '水の祝福',
            type: '水元素',
            id: 4,
          }
          break
        case 5:
          card_info = {
            img: '<img src="assets/jk/images/card/card2.png" />',
            title: '火の簇拥',
            type: '火元素',
            id: 5,
          }
          break
        case 6:
          card_info = {
            img: '<img src="assets/jk/images/card/card3.png" />',
            title: '风の加持',
            type: '风元素',
            id: 6,
          }
          break
        case 7:
          card_info = {
            img: '<img src="assets/jk/images/card/card4.png" />',
            title: '暗の环绕',
            type: '暗元素',
            id: 7,
          }
          break
        case 8:
          card_info = {
            img: '<img src="assets/jk/images/card/card5.png" />',
            title: '光の庇佑',
            type: '光元素',
            id: 8,
          }
          break
        default:
          break
      }

      return card_info
    },
    //抽奖
    lottery: function (e) {
      var e = e || window.event,
        current = e.currentTarget,
        is_frop = $(current).hasClass('flop'),
        that = this

      //判断活动是否结束
      if (this.actEnd('2020/07/02 23:59:00')) {
        $('body').toast({
          position: 'fixed',
          content: '抽卡活动已结束，请尽快领取活动奖励哦~',
          duration: 2000,
        })
        return false
      }

      //判断是否登录
      if (!that.isLogin()) {
        return false
      }

      //判断是否绑定角色
      var role_info = storage.getItem('sy_role_info')
      if (!role_info) {
        that.bindPop()
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

        var top = $('.page3 .title').offset().top - 30
        $('html,body').animate({ scrollTop: top }, 700)

        return false
      }

      //翻牌效果
      if (is_frop) {
        $(current).removeClass('flop')
      } else {
        $(current).addClass('flop')
      }

      //开始抽奖
      setTimeout(function () {
        that.lotteryStart()
      }, 2000)
    },
    //抽奖开始
    lotteryStart: function () {
      var that = this,
        token = storage.getItem('sy_token'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally')

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
        url: that.config['activityapi_url'] + '/anniversary/luckDraw',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            lottery_num = parseInt(response.data.draw_num) //获取次数
            lottery_id = parseInt(response.data.gift_id) //获取序号
            lottery_type = parseInt(response.data.gift_type) //奖品类型
            lottery_name = response.data.gift_name //奖品名称
            need_card_num = parseInt(response.data.need_card_num) //还差多少张卡

            //抽奖结束
            that.lotteryEnd(lottery_id, lottery_type, lottery_name, need_card_num)
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.lottery, that))
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
    //抽奖结束返回
    lotteryEnd: function (item_id, item_type, item_name, need_card_num) {
      var that = this,
        token = storage.getItem('sy_token'),
        is_ally = storage.getItem('sy_is_ally')

      // 奖品类型 item_type（1=> 虚拟奖品 2=> 实物）
      lottery_type = item_type

      //卡牌奖励
      if (item_id == 4 || item_id == 5 || item_id == 6 || item_id == 7 || item_id == 8) {
        var card_info = that.lotteryCard(item_id),
          card_name = card_info['title'],
          card_res = card_info['type'],
          card_img = card_info['img'],
          card_tips = ''

        if (is_complete == '1') {
          card_tips = '你已合成5张元素卡,坐等开奖~'
        } else if (need_card_num > 0) {
          card_tips = '还差' + need_card_num + '张卡片集齐五元素卡，瓜分5亿钻石大礼吧〜'
        } else {
          card_tips = '你已集齐5张元素卡,赶紧合成吧~'
        }

        that.$dialog_lottery.find('.lottery-success3 .lottery-res span').html(card_name)
        that.$dialog_lottery.find('.lottery-success3 .lottery-name span').html(card_res)
        that.$dialog_lottery.find('.lottery-card').html(card_img)
        that.$dialog_lottery.find('.lottery-collect').html(card_tips)
        that.$dialog_lottery.find('.lottery-success').hide()
        that.$dialog_lottery.find('.lottery-success3').show()
      } else {
        //其他奖励
        that.$dialog_lottery.find('.lottery-success2 .lottery-res span').html(item_name)
        that.$dialog_lottery.find('.lottery-img').html('<img src="assets/jk/images/prize/' + item_id + '.png" />')
        that.$dialog_lottery.find('.lottery-success').hide()
        that.$dialog_lottery.find('.lottery-success2').show()
      }

      //显示抽奖成功弹窗
      that.$dialog_lottery.show()

      //重新开启抽奖
      lottery_open = !lottery_open

      that.isFirst = false
      that.getInfo()

      //抽奖打点
      var opt = {
        token: token,
        copyAcc: that.copyAcc,
        mixAcc: that.mixAcc,
        type: 1,
        step: 3,
      }

      if (is_ally) {
        opt.token = ''
        opt.type = 2
      }

      that.buryLog(opt)
    },
    //领取卡牌
    gatherPop: function () {
      var that = this

      $('body').toast({
        position: 'fixed',
        textAlign: 'center',
        content: '领取成功，钻石请前往【我的奖品】领取~',
        duration: 2000,
      })

      setTimeout(function () {
        that.$dialog_lottery.hide()
      }, 2000)
    },
    //合成稀有卡牌领取
    rarePop: function () {
      var that = this

      $('body').toast({
        position: 'fixed',
        textAlign: 'center',
        content: '领取成功，头像框请前往【我的奖品】领取~',
        duration: 2000,
      })

      setTimeout(function () {
        that.$dialog_lottery.hide()
      }, 2000)
    },
    //卡牌信息对应
    cardIdx: function (card_id) {
      var card_info = {
        img: '',
        title: '',
        type: '',
      }

      switch (card_id) {
        case 1:
          card_info = {
            img: '<img src="assets/jk/images/card/card1.png" />',
            title: '水の祝福',
            type: '水元素',
            id: 4,
          }
          break
        case 2:
          card_info = {
            img: '<img src="assets/jk/images/card/card2.png" />',
            title: '火の簇拥',
            type: '火元素',
            id: 5,
          }
          break
        case 3:
          card_info = {
            img: '<img src="assets/jk/images/card/card3.png" />',
            title: '风の加持',
            type: '风元素',
            id: 6,
          }
          break
        case 4:
          card_info = {
            img: '<img src="assets/jk/images/card/card4.png" />',
            title: '暗の环绕',
            type: '暗元素',
            id: 7,
          }
          break
        case 5:
          card_info = {
            img: '<img src="assets/jk/images/card/card5.png" />',
            title: '光の庇佑',
            type: '光元素',
            id: 8,
          }
          break
        default:
          break
      }

      return card_info
    },
    //选择赠送卡牌
    selectCard: function (e) {
      var e = e || window.event,
        current = e.currentTarget,
        card_id = parseInt($(current).attr('data-card')),
        card_num = parseInt($(current).attr('data-num'))

      //判断是否登录
      if (!this.isLogin()) {
        return false
      }

      //合成卡牌不可赠送
      if (card_id == 0) {
        this.$dialog_select.hide()
        this.$dialog_rare.show()
        return false
      }

      //卡牌数量小于2张不可赠送
      if (card_num < 2) {
        this.$dialog_send.find('.btn-share').hide()
      } else {
        this.$dialog_send.find('.btn-share').show()
      }

      //显示赠送的卡牌
      var card_info = this.cardIdx(card_id),
        card_tips = ''

      if (is_complete == '1') {
        card_tips = '你已合成5张元素卡,坐等开奖~'
      } else if (need_card_num > 0) {
        card_tips = '还差' + need_card_num + '张卡片集齐五元素卡，瓜分5亿钻石大礼吧〜'
      } else {
        card_tips = '你已集齐5张元素卡,赶紧合成吧~'
      }

      this.$dialog_send.find('.lottery-res span').html(card_info['title'])
      this.$dialog_send.find('.lottery-name span').html(card_info['type'])
      this.$dialog_send.find('.lottery-card').html(card_info['img'])
      this.$dialog_send.find('.lottery-collect').html(card_tips)
      this.$dialog_send.find('.btn-share').attr('data-card', card_id)
      this.$dialog_select.hide()
      this.$dialog_send.show()
    },
    //合成卡牌
    merge: function () {
      //判断是否登录
      if (!this.isLogin()) {
        return false
      }

      //已截止集齐5卡
      if (this.actEnd('2020/07/02 10:00:00')) {
        $('body').toast({
          position: 'fixed',
          textAlign: 'center',
          content: '合成失败~钻石瓜分已开始o(╥﹏╥)o',
          duration: 2000,
        })
        return false
      }

      //已经合成卡牌
      if (is_complete == '1') {
        this.$dialog_rare.show()
        return false
      }

      var that = this,
        token = storage.getItem('sy_token'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally')

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
        url: that.config['activityapi_url'] + '/anniversary/merge',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0 || response.code == 5001) {
            that.$dialog_lottery.show()
            that.$dialog_lottery.find('.lottery-success').hide()
            that.$dialog_lottery.find('.lottery-success4').show()

            //更新数据
            that.isFirst = false
            that.getInfo()
          } else if (response.code == 1003) {
            that.refreshToken(token, $.proxy(that.merge, that))
          } else if (response.code == 5002) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '还差' + need_card_num + '张集齐哦，继续做任务抽奖吧~',
              duration: 2000,
            })
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
    //送给好友开启选择弹窗
    send: function () {
      //判断是否登录
      if (!this.isLogin()) {
        return false
      }

      this.$dialog_select.show()
    },
    //瓜分奖品
    divide: function () {
      //判断是否登录
      if (!this.isLogin()) {
        return false
      }

      //判断活动是否到达开奖日期
      if (!this.actEnd('2020/07/02 10:00:00')) {
        $('body').toast({
          position: 'fixed',
          textAlign: 'center',
          content: '还未开奖，敬请期待哦~',
          duration: 2000,
        })
        return false
      }

      // 请求接口瓜分砖石
    },
    //生成二维码
    qrcodeInit: function (acc_id, type, cardId, code) {
      var id = Base64.encode('copyAcc=' + acc_id + '&type=' + type + '&cardId=' + cardId + '&cardCode=' + code)
      var url = this.config.base_url + '?' + id
      var qrcode = this.$share_qrcode.qrcode({
        width: 228,
        height: 228,
        text: url,
      })

      console.log('copyAcc=' + acc_id + '&type=' + type + '&cardId=' + cardId + '&cardCode=' + code)
      console.log(url)

      return qrcode
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
    drawAndShareImage: function (imgBase64, card_id) {
      var that = this,
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        ratio = that.getPixelRatio(context)

      canvas.width = 750 * ratio
      canvas.height = 1224 * ratio
      context.fillStyle = '#fff'
      context.rect(0, 0, canvas.width, canvas.height)

      var myImage = new Image()
      myImage.src = './assets/jk/images/share/' + card_id + '.jpg'
      myImage.crossOrigin = 'Anonymous'

      myImage.onload = function () {
        context.drawImage(myImage, 0, 0, 750 * ratio, 1224 * ratio)

        var myImage2 = new Image()
        myImage2.src = imgBase64
        myImage2.crossOrigin = 'Anonymous'

        myImage2.onload = function () {
          context.fillStyle = '#fff'
          context.rect(0, 0, canvas.width, canvas.height)
          context.drawImage(myImage2, 286 * ratio, 936 * ratio, 180 * ratio, 180 * ratio)
          var base64 = canvas.toDataURL('image/jpeg')
          that.$dialog_share.find('.share-card .download').attr('href', base64)
          that.$dialog_share.find('.share-card img').attr('src', base64)
          that.$dialog_loading.hide()
          that.$dialog_share.show()
        }
      }
    },
    //获取分享码
    getBuildCode: function (card_id) {
      var that = this,
        token = storage.getItem('sy_token'),
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc'),
        is_ally = storage.getItem('sy_is_ally'),
        card_info = that.cardIdx(card_id),
        cardId = card_info['id'],
        acc_id = '', //账号id
        type = 1 //登录来源类型

      that.$dialog_send.hide()
      that.$dialog_loading.show()

      api_params = {}
      api_params['token'] = token
      api_params['type'] = 1

      if (is_ally) {
        api_params['token'] = 0
        api_params['type'] = 2
        api_params['mixAcc'] = mixAcc

        acc_id = mixAcc
        type = 2
      } else {
        acc_id = acc['account_id']
        type = 1
      }

      api_params['card_id'] = cardId
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/anniversary/buildCode',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            var code = response.data.code
            var qrcode = that.qrcodeInit(acc_id, type, cardId, code)
            var dataURL = qrcode.find('canvas').get(0).toDataURL()
            that.drawAndShareImage(dataURL, card_id)

            // 打点
            var opt = {
              token: token,
              copyAcc: that.copyAcc,
              mixAcc: '',
              type: 1,
              step: 4,
            }

            if (is_ally) {
              opt.token = ''
              opt.type = 2
              opt.mixAcc = mixAcc
            }

            that.buryLog(opt, function () {
              that.isFirst = false
              that.getInfo()
            })
          } else if (response.code == 5003) {
            that.$dialog_loading.hide()

            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '多出的卡片才可以分享给好友哦~',
              duration: 2000,
            })
          } else {
            that.$dialog_loading.hide()

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
    //分享弹窗
    sharePop: function (e) {
      var e = e || window.event,
        current = e.currentTarget,
        card_id = parseInt($(current).attr('data-card'))

      //判断是否登录
      if (!this.isLogin()) {
        this.$dialog_send.hide()
        return false
      }

      //获取code生成分享图片
      this.getBuildCode(card_id)
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
    //角色绑定更新
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
        url: that.config['activityapi_url'] + '/anniversary/editRole',
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
    //更改绑定角色
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
        url: that.config['activityapi_url'] + '/anniversary/editRole',
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
    //获取分享的卡片接口
    getShareCard: function () {
      //判断是否登录
      if (!this.isLogin()) {
        this.$dialog_packet.hide()
        return false
      }

      //隐藏分享卡领取
      this.$dialog_packet.hide()

      if (!this.cardCode) {
        return false
      }

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

      api_params['code'] = that.cardCode
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/anniversary/getShareCard',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '领取成功~',
              duration: 2000,
            })
          } else if (response.code == 5004) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: 'o(╥﹏╥)o卡片已被领取~',
              duration: 2000,
            })
          } else if (response.code == 5006) {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: '领取失败，你已拥有该卡片~',
              duration: 2000,
            })
          } else {
            $('body').toast({
              position: 'fixed',
              textAlign: 'center',
              content: response.message,
              duration: 2000,
            })
          }

          // 打点
          var opt = {
            token: token,
            copyAcc: that.copyAcc,
            mixAcc: '',
            type: 1,
            step: 7,
          }

          if (is_ally) {
            opt.token = ''
            opt.type = 2
            opt.mixAcc = mixAcc
          }

          that.buryLog(opt, function () {
            that.isFirst = false
            that.getInfo('login')
          })
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
    //回归玩家状态更新
    backRole: function (data) {
      var that = this,
        token = storage.getItem('sy_token'),
        acc = storage.getItem('sy_acc'),
        mixAcc = storage.getItem('sy_mixAcc'),
        api_params = {}

      if (acc != null) {
        api_params['account_id'] = acc['account_id']
      } else if (mixAcc != null) {
        api_params['account_id'] = mixAcc
      }

      api_params['back_acc'] = data['back_acc']
      api_params['back_no'] = data['code']
      api_params['ctime'] = data['ctime']
      api_params['flag'] = data['flag']
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/anniversary/backRole',
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
    //生成分享回归码
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
        url: that.config['activityapi_url'] + '/anniversary/backNo',
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
    //抽奖收获地址填写
    addressPop: function (e) {
      //关闭抽奖弹窗
      this.$dialog_lottery.hide()

      //判断是否实物及填写地址
      if (!lottery_address && lottery_type == 2) {
        this.$dialog_address.show()
      } else {
        this.myPop()
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
        url: that.config['activityapi_url'] + '/anniversary/main',
        data: api_params,
        type: 'post',
        success: function (response) {
          if (response.code == 0) {
            // 是否填写收货地址 0否 1是
            if (response.data.is_commit_address == 0) {
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
            that.refreshToken(token, $.proxy(that.addPop, that))
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
              textAlign: 'center',
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
        url: that.config['activityapi_url'] + '/anniversary/editInfo',
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
              textAlign: 'center',
              content: response.message,
              duration: 2000,
            })
          }
        },
        complete: function (XMLHttpRequest, textStatus) {
          if (XMLHttpRequest.status != 200) {
            that.$dialog_address.toast({
              textAlign: 'center',
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
        id = $(current).attr('data-id'),
        ctime = $(current).attr('data-ctime'),
        flag = $(current).attr('data-flag')

      api_params['role_id'] = role_id
      api_params['platform'] = platform
      api_params['zone_id'] = zone_id
      api_params['account_id'] = account_id
      api_params['id'] = id
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
            that.editGift(id)
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
    editGift: function (id) {
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

      api_params['id'] = id
      api_params['role_name'] = role_info['role_name']
      api_params['server_name'] = role_info['server_name']
      api_params['role_id'] = role_info['role_id']
      api_params['platform'] = role_info['platform']
      api_params['zone_id'] = role_info['zone_id']
      api_params['ts'] = Math.round(new Date() / 1000)
      api_params['sign'] = sign(api_params, that.config['activity_secret'])

      $.ajax({
        url: that.config['activityapi_url'] + '/anniversary/editGift',
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

        if (data[i]['gift_id'] == 4 || data[i]['gift_id'] == 5 || data[i]['gift_id'] == 6 || data[i]['gift_id'] == 7 || data[i]['gift_id'] == 8) {
          html += '<div class="e1">' + data[i]['masonry'] + '钻石</div>'
        } else {
          html += '<div class="e1">' + data[i]['gift_name'] + '</div>'
        }

        html += '<div class="e2">' + time + '</div>'

        if (parseInt(data[i]['type']) == 2) {
          html += '<div class="e3">实物</div>'
        } else if (data[i]['role_info'] != null && data[i]['send_status'] == '1') {
          html += '<div class="e3">已发给' + data[i]['role_info']['server_name'] + '-' + data[i]['role_info']['role_name'] + '</div>'
        } else {
          html += '<div class="e3 receive" data-account_id = "' + data[i]['account_id'] + '"'
          html += 'data-id="' + data[i]['id'] + '"'
          html += 'data-ctime="' + data[i]['ctime'] + '"'
          html += 'data-flag="' + data[i]['flag'] + '">'
          html += '<a href="javascript:;">领取</a></div>'
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
        url: that.config['activityapi_url'] + '/anniversary/giftList',
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
        url: that.config['activityapi_url'] + '/anniversary/log',
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
    //卡牌
    slideInit: function () {
      $('.card-slide').slide({
        titCell: '.hd ul',
        mainCell: '.bd ul',
        autoPage: false,
        effect: 'left',
        autoPlay: !1,
        autoPage: !0,
        pnLoop: !1,
        scroll: 1,
        vis: 5,
        trigger: 'click',
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
        navigation: {
          nextEl: '.feature-next',
          prevEl: '.feature-prev',
        },
        effect: 'coverflow',
        coverflowEffect: {
          rotate: 0,
          stretch: 224,
          depth: 200,
          modifier: 1,
          slideShadows: false,
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
    task: function (e) {
      var top = $('.page3 .title').offset().top - 16
      $('html,body').animate({ scrollTop: top }, 700)
    },
    rule: function (e) {
      var top = $('.page6 .title').offset().top - $('.header').height()
      $('html,body').animate({ scrollTop: top }, 700)
    },
    //视频播放
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
