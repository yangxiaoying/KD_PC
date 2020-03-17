/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/search/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/search/index.js":
/*!***********************************!*\
  !*** ./assets/js/search/index.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n$(function () {\n    var url = decodeURI(location.href);\n    var keyword = url.substr(url.indexOf('=') + 1);\n    getCollection();\n    // 0 全部 1 微刊 2好文 3音频 4视频 5图集 6看典号 7期刊 8 图书\n    function getCollection() {\n        var url = encodeURI('/search/getSearchResult?keyword=' + keyword);\n        $.ajax({\n            type: \"GET\",\n            url: url,\n            dataType: \"json\",\n            success: function success(response) {\n                if (response.code == 0) {\n                    var _response$data = response.data,\n                        goodessaylist = _response$data.goodessaylist,\n                        articlelist = _response$data.articlelist,\n                        audiolist = _response$data.audiolist,\n                        bookllist = _response$data.bookllist,\n                        journallist = _response$data.journallist,\n                        mircbooklist = _response$data.mircbooklist,\n                        orglist = _response$data.orglist,\n                        picslist = _response$data.picslist,\n                        videolist = _response$data.videolist;\n                    // console.log(response.data);\n\n                    createMicrobookDom(mircbooklist);\n                    createGoodessayDom(goodessaylist);\n                    createVideoDom(videolist);\n                    createAudioDom(audiolist);\n                    createPicslistDom(picslist);\n                    createArticleDom(articlelist);\n                    createPeriodDom(journallist);\n                    createBookDom(bookllist);\n                    createKdhDom(orglist);\n                }\n            }\n        });\n    }\n    // 微刊\n    function createMicrobookDom(mircbooklist) {\n        var str = '';\n        var total = mircbooklist.total,\n            rows = mircbooklist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s1').hide();\n            return;\n        }\n        $('.s1 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                str += '<div class=\"li\">\\n                            <div class=\"pic\"><a href=\"/detail/microBookDetail?id=' + rows[i].id + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"360\" height=\"160\"></a><div class=\"num\"><span class=\"num1\">' + rows[i].childcollectioncount + '</span><span class=\"num2\">' + rows[i].viewcount + '</span></div></div>\\n                            <div class=\"name\">\\n                                <span class=\"text\"><a href=\"/detail/microBookDetail?id=' + rows[i].id + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword) + '</a></span>\\n                            </div>\\n                            <div class=\"info\"><a href=\"/kdh/home/' + rows[i].orgid + '\" target=\"_blank\" class=\"left\"><img src=\"' + rows[i].logopic + '\">' + rows[i].orgname + '</a><span class=\"right time\">' + $.kd.dateFormat(rows[i].submittime) + '</span></div>\\n                        </div>';\n            }\n        }\n        $('.s1 .ul').html(str);\n    }\n    // 图文\n    function createGoodessayDom(goodessaylist) {\n        var str = '';\n        var total = goodessaylist.total,\n            rows = goodessaylist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s2').hide();\n            return;\n        }\n        $('.s2 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                var iscollect = rows[i].iscollect;\n                var active = iscollect ? 'active' : '';\n                str += '<div class=\"li\" data-id=\"' + rows[i].id + '\">\\n                            <a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=1\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\"></a>\\n                            <h2><a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=1\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword) + '</a></h2>\\n                            <p>' + $.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', keyword) + '</p>\\n                            <div class=\"bottom\">\\n                                <span class=\"name left\">' + rows[i].author + '</span>\\n                                <div class=\"num right\">\\n                                    <a href=\"javascript:;\" class=\"collect ' + active + ' right\">' + rows[i].collectcount + '</a><span class=\"view right\">' + rows[i].viewcount + '</span>\\n                                </div>\\n                            </div>\\n                        </div>';\n            }\n        }\n        $('.s2 .ul').html(str);\n    }\n    // 视频\n    function createVideoDom(videolist) {\n        var str = '';\n        var total = videolist.total,\n            rows = videolist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s3').hide();\n            return;\n        }\n        $('.s3 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                str += '<div class=\"li\">\\n                            <a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=3\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\"></a>\\n                            <span class=\"icon\"></span>\\n                            <h2><a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=3\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword) + '</a></h2>\\n                            <p>' + $.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', keyword) + '</p>\\n                            <div class=\"bottom\">\\n                                <span class=\"name left\">' + rows[i].author + '</span>\\n                                <div class=\"num right\">\\n                                    <a href=\"javascript:;\" class=\"collect right\">' + rows[i].collectcount + '</a><span class=\"view right\">' + rows[i].viewcount + '</span>\\n                                </div>\\n                            </div>\\n                        </div>';\n            }\n        }\n        $('.s3 .ul').html(str);\n    }\n    // 音频\n    function createAudioDom(audiolist) {\n        var str = '';\n        var total = audiolist.total,\n            rows = audiolist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s4').hide();\n            return;\n        }\n        $('.s4 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 4) {\n                str += '<div class=\"li left\">\\n                            <a class=\"img\" href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=2\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\"/></a>\\n                            <h2><a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=2\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword) + '</a></h2>\\n                            <div class=\"bottom\">\\n                                <span class=\"name left\">' + rows[i].author + '</span>\\n                                <div class=\"num right\">\\n                                    <a href=\"javascript:;\" class=\"collect right\">' + rows[i].collectcount + '</a><span class=\"view right\">' + rows[i].viewcount + '</span>\\n                                </div>\\n                            </div>\\n                        </div>';\n            }\n        }\n        $('.s4 .ul').html(str);\n    }\n    // 图集\n    function createPicslistDom(picslist) {\n        var str = '';\n        var total = picslist.total,\n            rows = picslist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s5').hide();\n            return;\n        }\n        $('.s5 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 4) {\n                str += '<div class=\"li\">\\n                            <a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=4\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\"></a>\\n                            <span class=\"icon\"></span>\\n                            <h2><a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=4\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword) + '</a></h2>\\n                            <p>' + $.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', keyword) + '</p>\\n                            <div class=\"bottom\">\\n                                <span class=\"name left\">' + rows[i].author + '</span>\\n                                <div class=\"num right\">\\n                                    <a href=\"javascript:;\" class=\"collect right\">' + rows[i].collectcount + '</a><span class=\"view right\">' + rows[i].viewcount + '</span>\\n                                </div>\\n                            </div>\\n                        </div>';\n            }\n        }\n        $('.s5 .ul').html(str);\n    }\n    // 文献\n    function createArticleDom(articlelist) {\n        var str = '';\n        var total = articlelist.total,\n            rows = articlelist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s6').hide();\n            return;\n        }\n        $('.s6 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 8) {\n                var icon = '';\n                if (rows[i].DownloadFlag == 'pdf') {\n                    icon = 'pdf';\n                } else {\n                    icon = 'epub';\n                }\n\n                if (i % 2 == 0) {\n                    str += '<div class=\"li left ' + icon + '\">\\n                                <p class=\"p1\"><a href=\"/literature/literatureDetail?filename=' + rows[i].FileName + '&dbType=' + rows[i].DBName.substring(0, 4) + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].Title, '~#@', '@#~', keyword) + '</a></p>\\n                                <p class=\"p2\">' + rows[i].Author + '\\u300A' + rows[i].PublishName + '\\u300B;' + rows[i].Year + '\\u5E74' + rows[i].Period + '\\u671F</p>\\n                            </div>';\n                } else {\n                    str += '<div class=\"li right ' + icon + '\">\\n                                <p class=\"p1\"><a href=\"/literature/literatureDetail?filename=' + rows[i].FileName + '&dbType=' + rows[i].DBName.substring(0, 4) + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].Title, '~#@', '@#~', keyword) + '</a></p>\\n                                <p class=\"p2\">' + rows[i].Author + '\\u300A' + rows[i].PublishName + '\\u300B;' + rows[i].Year + '\\u5E74' + rows[i].Period + '\\u671F</p>\\n                            </div>';\n                }\n            }\n        }\n        $('.s6 .ul').html(str);\n    }\n    // 期刊\n    function createPeriodDom(journallist) {\n        var str = '';\n        var total = journallist.total,\n            rows = journallist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s7').hide();\n            return;\n        }\n        $('.s7 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 5) {\n                str += '<div class=\"li\">\\n                            <a href=\"/detail/periodDetail/' + rows[i].code + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\"/></a>\\n                            <p><a href=\"/detail/periodDetail/' + rows[i].code + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].name, '~#@', '@#~', keyword) + '</a></p>\\n                        </div>';\n            }\n        }\n        $('.s7 .ul').html(str);\n    }\n    // 图书\n    function createBookDom(bookllist) {\n        var str = '';\n        var total = bookllist.total,\n            rows = bookllist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s8').hide();\n            return;\n        }\n        $('.s8 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 5) {\n                str += '<div class=\"li\">\\n                            <a href=\"/detail/bookDetail/' + rows[i].sku + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\"></a> \\n                            <p><a href=\"/detail/bookDetail/' + rows[i].sku + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword) + '</a></p>\\n                        </div>';\n            }\n        }\n        $('.s8 .ul').html(str);\n    }\n    // 看典号\n    function createKdhDom(orglist) {\n        var str = '';\n        var total = orglist.total,\n            rows = orglist.rows;\n\n        if (rows && rows.length == 0) {\n            $('.s9').hide();\n            return;\n        }\n        $('.s9 .title h1 i').html(total);\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 5) {\n                str += '<div class=\"li\">\\n                            <a href=\"/kdh/home/' + rows[i].orgid + '\" target=\"_blank\" class=\"img left\"><img src=\"' + rows[i].logopic + '\"></a>\\n                            <div class=\"info left\">\\n                                <p class=\"p1\"><a href=\"/kdh/home/' + rows[i].orgid + '\" target=\"_blank\">' + $.kd.keywordStyleRed(rows[i].orgname, '~#@', '@#~', keyword) + '</a></p>\\n                                <p class=\"p2\">' + $.kd.keywordStyleRed(rows[i].memo, '~#@', '@#~', keyword) + '</p>\\n                            </div>\\n                        </div>';\n            }\n        }\n        $('.s9 .ul').html(str);\n    }\n\n    $('.section').on('click', '.collect', function () {\n        var _this = $(this);\n        var id = $(this).parents('.li').attr('data-id');\n\n        function addCollect(id) {\n            var url = '/common/addCollect/' + id;\n            $.ajax({\n                url: url,\n                dataType: \"json\",\n                type: \"GET\",\n                success: function success(response) {\n                    if (response.code == 0) {\n                        if (response.data.status == 1) {\n                            $('.pop').show().html(response.data.info).fadeOut(2000);\n                            _this.addClass('active');\n                        }\n                    }\n                }\n            });\n        }\n\n        function cancelCollect(id) {\n            var url = '/common/cancelCollect/' + id;\n            $.ajax({\n                url: url,\n                dataType: \"json\",\n                type: \"GET\",\n                success: function success(response) {\n                    if (response.code == 0) {\n                        if (response.data.status == 0) {\n                            $('.pop').show().html(response.data.info).fadeOut(2000);\n                            _this.removeClass('active');\n                        }\n                    }\n                }\n            });\n        }\n        if ($(this).hasClass('active')) {\n            $(this).removeClass('active');\n            cancelCollect(id);\n        } else {\n            $(this).addClass('active');\n            addCollect(id);\n        }\n    });\n});\n\n//# sourceURL=webpack:///./assets/js/search/index.js?");

/***/ })

/******/ });