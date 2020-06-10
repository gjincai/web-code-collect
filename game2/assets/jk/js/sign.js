function sortByACII(target) {
    var arr = new Array();
    var num = 0;
    for (var i in target) {
        arr[num] = i;
        num++;
    }
    var sortArr = arr.sort();
    var sortTarget = {};
    for (var i in sortArr) {
        sortTarget[sortArr[i]] = target[sortArr[i]];
    }
    return sortTarget;
}

function transString(target) {
    var arr = new Array();
    var i = 0;
    for (var key in target) {
        arr[i] = unifiedEncode(key) + '=' + unifiedEncode(target[key]);
        i++;
    }
    return arr.join('&');
}

function isChinese(str) {
    if(/.*[\u4e00-\u9fa5]+.*$/.test(str))
    {
        return false;
    }
    return true;
}

function unifiedEncode(str) {
    var escape_code = encodeURIComponent(str);
    if(isChinese(escape_code)){
        return escape_code;
    }
    escape_code = escape_code.replace('@', '%40');
    escape_code = escape_code.replace('*', '%2A');
    escape_code = escape_code.replace('+', '%2B');
    escape_code = escape_code.replace('/', '%2F');
    escape_code = escape_code.replace('!', '%21');
    escape_code = escape_code.replace('(', '%28');
    escape_code = escape_code.replace(')', '%29');
    escape_code = escape_code.replace('\'', '%27');
    escape_code = escape_code.replace('~', '%7E');
    return escape_code;
}

function sign(toSign, secret) {
    toSign = sortByACII(toSign);
    toSign = transString(toSign);
    return sha1(toSign + secret);
}

