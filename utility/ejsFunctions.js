var moment = require('moment');

module.exports = {
    // 格式化时间
    dateFormat: function (date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    },
    // 格式化时间
    dateFormatBySetting: function (date, format) {
        return moment(date).format(format);
    },
    dateFormatFromNow: function (date) {
        return moment(date).fromNow();
    },
    // 以空格为分隔符的字符串转化为数组
    arrayParseByBlank: function (str) {
        return str.split(" ");
    },
    // 以两个英文分号为分隔符的字符串转化为数组
    arrayParseBySemi: function (str) {
        return str.split(";");
    },
    //以井号分隔符的字符串转化为数组
    arrayParseByPound: function (str) {
        return str.split("#");
    },
    //去掉字符串中的井号
    deletePound: function (str) {
        return str.replace(/#/g,"");
    },
    //vip判断包年包月截取标题后四个字符
    judgeVip:function(str){
        var strLength = str.length;
        return str.substring(strLength-4,strLength);;
    },
    // 关键词转数组
    // 分隔符包括两个分号，一个分号，冒号，逗号，中文逗号，两个空格，一个空格
    stringToArray: function (str) {
        if (str.trim().length) {
            if (str.indexOf(';;') != -1) {
                return str.split(';;');
            } else if (str.indexOf(';') != -1) {
                return str.split(';');
            } else if (str.indexOf('  ') != -1) {
                return str.split('  ');
            } else if (str.indexOf(' ') != -1) {
                return str.split(' ');
            } else if (str.indexOf(',') != -1) {
                return str.split(',');
            } else if (str.indexOf('，') != -1) {
                return str.split('，');
            } else if (str.indexOf(':') != -1) {
                return str.split(':');
            } else if (str.indexOf('：') != -1) {
                return str.split('：');
            }
            return [str];
        } else {
            return '';
        }

    },

    // 搜索结果关键字标红 标示~#@ @#~ 转为<span class="cRed"></span> 或者
    // 直接转化关键字样式
    keywordStyleRed: function (str, prefix, postfix, keyword) {
        var prefixPosition = str.indexOf(prefix);
        var postfixPosition = str.indexOf(postfix);
        if (prefixPosition != -1 && postfixPosition) {
            var newStr = str.replace(new RegExp(prefix, 'g'), '<span class="cRed">');
            newStr = newStr.replace(new RegExp(postfix, 'g'), '</span>');
            return newStr;
        } else if (keyword) {
            var newStr = str.replace(new RegExp(keyword, 'g'), '<span class="cRed">' + keyword + '</span>');
            return newStr;
        } else {
            return str;
        }
    },

    ceil: function (value) {
        return Math.ceil(value);
    },
    floor: function (value) {
        return Math.floor(value);
    },
    encodeURL: function (str) {
        return encodeURI(str);
    },
    decodeURL: function (str) {
        return decodeURI(str);
    },
    substring: function (str, start, end) {
        return str.substring(start, end);
    },
    typeof: function (obj) {
        return typeof(obj);
    },
    // 将作品分类code转化为作品页面x/y/z
    workCodeParseToCoord: function (workCode) {
        var coord = {
            x: -1,
            y: -1,
            z: -1
        }
        var letterStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (workCode && workCode.length >= 1) {
            // 一级分类
            coord.x = letterStr.indexOf(workCode.substring(0, 1));
        }
        if (workCode.length >= 3) {
            // 二级分类
            coord.y = parseInt(workCode.substring(1, 3)) - 1;
        }
        if (workCode.length == 5) {
            // 三级分类
            coord.z = parseInt(workCode.substring(3)) + 1; // 下拉列表原因需要+1
        }
        return coord;
    },
    // 限制输出字数
    limitWordCount: function (str, num) {
        if (str) {
            if (num > 0) {
                return str.substring(0, num);
            } else {
                return str;
            }
        }
    },
    // 过滤关键字后的数字，如 历史名人:1234 变为 历史名人
    filterKeyword: function (keyword) {
        var index = keyword.indexOf(':');
        if (index != -1) {
            return keyword.substring(0, index);
        } else {
            return keyword;
        }
    },
    //去除前后空格
    trim: function (str) {
        return str.trim();
    }
};