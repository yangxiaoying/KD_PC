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
/******/ 	return __webpack_require__(__webpack_require__.s = "./assets/js/search/kdh.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/js/search/kdh.js":
/*!*********************************!*\
  !*** ./assets/js/search/kdh.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n$(function () {\n    var url = decodeURI(location.href);\n    var keyword = url.substr(url.indexOf('=') + 1);\n    var kdhWrap = $('.kdhWrap');\n    var kdhList = kdhWrap.find('.listWrap .list');\n    var page = $('#sp-page');\n    var asideMicrobook = $('.search-main .aside .wk');\n    var asidePeriod = $('.search-main .aside .period');\n    var asideBook = $('.search-main .aside .book');\n    var asideWorks = $('.search-main .aside .works');\n\n    getCollection();\n    createKdhDom();\n\n    function getCollection() {\n        var url = encodeURI('/search/getSearchResult?keyword=' + keyword);\n        $.ajax({\n            type: \"GET\",\n            url: url,\n            dataType: \"json\",\n            success: function success(response) {\n                if (response.code == 0) {\n                    var _response$data = response.data,\n                        journallist = _response$data.journallist,\n                        mircbooklist = _response$data.mircbooklist,\n                        bookllist = _response$data.bookllist,\n                        collectionlist = _response$data.collectionlist;\n\n                    createMicrobookDom(mircbooklist);\n                    createPeriodDom(journallist);\n                    createBookDom(bookllist);\n                    createWorksDom(collectionlist);\n                }\n            }\n        });\n    }\n    // 看典号\n    function createKdhDom(pageNum) {\n        var pageNum = pageNum || 1;\n        var limit = 15;\n        var type = 6;\n        var url = '/search/getSearchResult';\n\n        $.ajax({\n            type: \"GET\",\n            url: url,\n            data: {\n                keyword: keyword,\n                pageNum: pageNum,\n                limit: limit,\n                type: type\n            },\n            dataType: \"json\",\n            success: function success(response) {\n                if (response.code == 0) {\n                    var orglist = response.data.orglist;\n                    var total = orglist.total,\n                        rows = orglist.rows;\n\n                    var str = '';\n                    if (rows && rows.length == 0) {\n                        num.html(0);\n                        kdhList.html('<div class=\"blank\"></div>');\n                        page.html('');\n                        return;\n                    }\n                    for (var i = 0; i < rows.length; i++) {\n                        var concernBtn = '';\n                        if (rows[i].isconcern == 0) {\n                            concernBtn = '<a href=\"javascript:;\" class=\"follow\" data-orgid=\"' + rows[i].orgid + '\">\\u5173\\u6CE8</a>';\n                        } else {\n                            concernBtn = '<a href=\"javascript:;\" class=\"follow active\" data-orgid=\"' + rows[i].orgid + '\">\\u5DF2\\u5173\\u6CE8</a>';\n                        }\n                        str += '<div class=\"item\">\\n                                    <a href=\"/kdh/home/' + rows[i].orgid + '\" target=\"_blank\" class=\"link\">\\n                                        <img class=\"cover\" src=\"' + rows[i].backgroundpic + '\">\\n                                        <img class=\"logo\"  src=\"' + rows[i].logopic + '\">\\n                                        <h1>' + $.kd.keywordStyleRed(rows[i].orgname, '~#@', '@#~', keyword) + '</h1>\\n                                        <p class=\"p1\">' + $.kd.keywordStyleRed(rows[i].memo, '~#@', '@#~', keyword) + '</p>\\n                                        <p class=\"p1\">\\u4F5C\\u54C1\\uFF1A' + rows[i].collectioncount + ' | \\u6D4F\\u89C8\\u91CF\\uFF1A' + rows[i].clickcount + '</p>\\n                                    </a> \\n                                    ' + concernBtn + '\\n                                </div>';\n                    }\n                    kdhList.html(str);\n                    var pageStr = $.kd.outputPager(total, limit, 5, pageNum);\n                    page.html(pageStr);\n                }\n            }\n        });\n    }\n    // 相关微刊\n    function createMicrobookDom(mircbooklist) {\n        var total = mircbooklist.total,\n            rows = mircbooklist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asideMicrobook.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                str += '<li>\\n                            <a href=\"/detail/microBookDetail?id=' + rows[i].id + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"230\" height=\"102\"></a>\\n                            <p><a href=\"/detail/microBookDetail?id=' + rows[i].id + '\" target=\"_blank\">' + rows[i].title + '</a></p>\\n                        </li>';\n            }\n        }\n        asideMicrobook.find('.list').html(str);\n    }\n    // 相关期刊\n    function createPeriodDom(journallist) {\n        var total = journallist.total,\n            rows = journallist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asidePeriod.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 4) {\n                str += '<li>\\n                            <a href=\"/detail/periodDetail/' + rows[i].code + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"90\" height=\"128\"></a>\\n                            <p class=\"p1\"><a href=\"/detail/periodDetail/' + rows[i].code + '\" target=\"_blank\">' + rows[i].name + '</a></p>\\n                            <p class=\"p2\">' + rows[i].lastestyear + '\\u5E74' + rows[i].lastestperiod + '\\u671F</p>\\n                        </li>';\n            }\n        }\n        asidePeriod.find('.list').html(str);\n    }\n    // 相关图书\n    function createBookDom(bookllist) {\n        var total = bookllist.total,\n            rows = bookllist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asideBook.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 4) {\n                str += '<li>\\n                        <a href=\"/detail/bookDetail/' + rows[i].sku + '\" target=\"_blank\"><img src=\"' + rows[i].coverpic + '\" width=\"90\" height=\"128\"></a>\\n                        <p class=\"p1\"><a href=\"/detail/bookDetail/' + rows[i].sku + '\" target=\"_blank\">' + rows[i].title + '</a></p>\\n                        <p class=\"p2\"><span>' + rows[i].bookauthor + '</p>\\n                    </li>';\n            }\n        }\n        asideBook.find('.list').html(str);\n    }\n    // 相关作品\n    function createWorksDom(collectionlist) {\n        var total = collectionlist.total,\n            rows = collectionlist.rows;\n\n        var str = '';\n        if (rows && rows.length == 0) {\n            asideWorks.hide();\n            return;\n        }\n        for (var i = 0; i < rows.length; i++) {\n            if (i < 3) {\n                str += '<li>\\n                            <a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=' + rows[i].mediatype + '\" target=\"_blank\" class=\"img left\"><img src=\"' + rows[i].coverpic + '\" width=\"100\" height=\"56\"></a>\\n                            <p class=\"title left\"><a href=\"/detail/workDetail?id=' + rows[i].id + '&mediatype=' + rows[i].mediatype + '\" target=\"_blank\">' + rows[i].title + '</a></p>\\n                        </li>';\n            }\n        }\n        asideWorks.find('.list').html(str);\n    }\n    // 页码\n    page.on('click', 'a', function () {\n        $('body,html').animate({ scrollTop: 0 }, 200);\n        var pageNum = $(this).attr('data-page');\n        createKdhDom(pageNum);\n    });\n    // 关注或取消关注\n    kdhList.on('click', '.follow', function () {\n        var orgid = $(this).attr('data-orgid');\n        var otype = 0;\n\n        function addOrCancelConcern(otype) {\n            var url = '/kdh/addOrCancelConcern/' + orgid + '?otype=' + otype;\n            $.ajax({\n                url: url,\n                dataType: \"json\",\n                type: \"GET\",\n                success: function success(response) {\n                    if (response.code == 0) {\n                        $('.pop').show().html(response.data.info).fadeOut(2000);\n                    }\n                }\n            });\n        }\n\n        if ($(this).hasClass('active')) {\n            $(this).removeClass('active').html('关注');\n            otype = 1;\n            addOrCancelConcern(otype);\n        } else {\n            $(this).addClass('active').html('已关注');\n            otype = 0;\n            addOrCancelConcern(otype);\n        }\n    });\n});\n\n//# sourceURL=webpack:///./assets/js/search/kdh.js?");

/***/ })

/******/ });