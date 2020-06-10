/*
* 基于localStorage制作一个本地存储插件storage.js，针对只能存字符串、不能设置时限等进行补充，设想：
* 在不支持localStorage时自动使用cookie
* 类型转换，可存储数字、布尔、对象等
* 可设置时限，超时就自我删除
* 附带整理cookie方法
* */
;(function(window) {
  var storage = {};

  // 是否支持localStorage
  if (!window.localStorage) {
    storage.support = false;
  } else {
    storage.support = true;
  }

  // time为超时时间（单位毫秒），非必填
  storage.setItem = function(key, value, time) {
    if (this.support) {
      if (typeof key != "string") {
        console.log("*STORAGE ERROR* key必须是字符串");
        return;
      }
      if (time) {
        if (typeof time != "number") {
          console.log("*STORAGE ERROR* time必须是数字");
          return;
        } else {
          time = parseInt(time) + (new Date()).getTime();
        }
      } else {
        time = null;
      }
      var setValue = {
        value: JSON.stringify(value),
        time: time
      }
      localStorage.setItem(key, JSON.stringify(setValue));
    } else {
      storage.setCookie(key, value, time)
    }
  };

  // 不存在的值会返回null
  storage.getItem = function(key) {
    if (this.support) {
      getValue = JSON.parse(localStorage.getItem(key));
      if (!getValue) {
        return null;
      }
      if (getValue.time && getValue.time < (new Date()).getTime()) {
        localStorage.removeItem(key);
        return null;
      } else {
        return JSON.parse(getValue.value)
      }
    } else {
      storage.getCookie(key)
    }
  };

  // 移除某个值
  storage.removeItem = function(key) {
    if (this.support) {
      localStorage.removeItem(key);
    } else {
      storage.removeCookie(key)
    }
  };
  // 清空存储
  storage.clear = function() {
    if (this.support) {
      localStorage.clear();
    } else {
      storage.clearCookie();
    }
  };

  /**** cookie方法 ****/
  storage.setCookie = function(key, value, time) {
    if (typeof key != "string") {
      console.log("*STORAGE ERROR* key必须是字符串");
      return;
    } else {
      if (typeof time != "number") {
        // cookie默认存365天
        time = 365 * 24 * 60 * 60 * 1000;
      }
      var d = new Date();
      d.setTime(d.getTime() + time);
      document.cookie = key + "=" + value + "; expires=" + d.toGMTString();
    }
  };
  storage.getCookie = function(key) {
    var cookies = document.cookie.split(";")
    var cookieValue;
    for (var i = 0; i < cookies.length; i++) {
      if (key == cookies[i].split("=")[0]) {
        cookieValue = cookies[i].split("=")[1];
        break;
      }
    }
    return cookieValue;
  };
  storage.removeCookie = function(key) {
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };
  storage.clearCookie = function() {
    var cookies = document.cookie.split(";")
    for (var i = 0; i < cookies.length; i++) {
      document.cookie = cookies[i].split("=")[0] + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  };

  window.storage = storage;
})(window);
