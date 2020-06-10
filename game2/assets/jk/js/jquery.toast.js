!(function ($) {
  'use strict'
  $.fn.toast = function (options) {
    var defaults = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      animateIn: 'fadeIn', //进入的动画
      animateOut: 'fadeOut', //结束的动画
      minWidth: '220px', //宽度
      padding: '10px 20px', //padding
      background: 'rgba(0,0,0,0.8)', //背景色
      borderRadius: '6px', //圆角
      duration: 3000, //定时器时间
      animateDuration: 500, //执行动画时间
      textAlign: 'left',
      fontSize: '14px', //字体大小
      color: '#fff', //文字颜色
      content: '这是一个提示信息', //提示内容
      zIndex: 1001, //层级,
      flag: true, //在打开下一个提示的时候立即关闭上一个提示
    }
    var opts = $.extend(defaults, options || {})
    return this.each(function () {
      var $this = $(this),
        box = '',
        timer = null
      defaults.createMessage = function () {
        if (opts.flag) {
          $('.toast').remove()
        }
        box = $('<span class="animated ' + opts.animateIn + ' toast"></span>')
          .css({
            position: opts.position,
            top: opts.top,
            left: opts.left,
            'min-width': opts.minWidth,
            padding: opts.padding,
            background: opts.background,
            'text-align': opts.textAlign,
            'font-size': opts.fontSize,
            color: opts.color,
            '-webkit-border-radius': opts.borderRadius,
            '-moz-border-radius': opts.borderRadius,
            'border-radius': opts.borderRadius,
            'z-index': opts.zIndex,
            '-webkit-transform': 'translate3d(-50%,-50%,0)',
            '-moz-transform': 'translate3d(-50%,-50%,0)',
            transform: 'translate3d(-50%,-50%,0)',
            '-webkit-animation-duration': opts.animateDuration / 1000 + 's',
            '-moz-animation-duration': opts.animateDuration / 1000 + 's',
            'animation-duration': opts.animateDuration / 1000 + 's',
          })
          .html(opts.content)
          .appendTo($this)
        defaults.colseMessage()
      }
      defaults.colseMessage = function () {
        timer = setTimeout(function () {
          box.remove()
        }, opts.duration)
      }
      defaults.createMessage()
    })
  }
})(jQuery)
