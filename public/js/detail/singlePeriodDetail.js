var url = decodeURI(location.href);
var thname = url.substr(url.lastIndexOf('/') + 1);
var magaCode = thname.substr(0, 4);
var magaYear = thname.substr(4, 4);
var magaPeriod = thname.substr(8, 2);
var periodImg = $('#periodImg');
var periodInfo = $('#periodInfo');
var bookRecommendList = $('#bookRecommendList');
var periodYear = $('#periodYear');
var periodMonth = $('#periodMonth');

var layer = '';
layui.use('layer', function() {
    layer = layui.layer;
});

getSinglePeriodDetail(thname);
getPeriodYear(magaYear);
getPeriodListByYear(magaYear, magaPeriod);
getPeriodCatalog(thname);

// 期刊
function getSinglePeriodDetail(thname) {
    var url = '/detail/getSinglePeriodDetail/' + thname;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var data = response.data;
                if (data.iscollect == 0) {
                    $('.periodical-collect').html('收藏');
                } else {
                    $('.periodical-collect').html('已收藏').addClass('active');
                }
                createDetailDom(data);
                createPeriodRecommendDom(data.recommend);
                $('title').html(data.name + '_' + data.title);

                var title = data.name;
                var coverPic = data.coverpic;
                var period = '';
                var price = $('.order-inputs input[data-type=2]').parent().find('span:last-child').html();
                var ordertype = 2;
                $('.order-inputs input[name=order]').change(function() {
                    price = $('.order-inputs input[name=order]:checked').parent().find('span:last-child').html();
                    ordertype = parseInt($('.order-inputs input[name=order]:checked').attr('data-type'));
                    period = ordertype == 2 ? '' : magaPeriod
                });

                // 订阅
                $('#orderBtn').click(function() {
                    location.href = encodeURI('/payment/checkout?code=' + magaCode + '&year=' + magaYear + '&period=' + period + '&title=' + title + '&price=' + price + '&ordertype=' + ordertype + '&coverPic=' + coverPic);
                });

            } else {
                console.log('检查前端期刊详情');
            }
        }
    });
}

function createDetailDom(data) {
    $('.breadcrumb .title').html(data.name);
    periodImg.attr('src', data.coverpic);
    periodInfo.attr('data-id', data.thName);
    periodInfo.find('.periodical-title').html(data.name);
    periodInfo.find('.periodical-time').html(data.title);
    $('#organizers').html(data.organizers);
    $('#issn').html(data.issn);
    $('#cycle').html(data.magaPrice.periodname);
    $('#cn').html(data.cn ? data.cn : '--');
    $('#lang').html(data.yz502);
    $('#createTime').html(data.ck401 + '年');
    $('#price').html(data.magaPrice.price);
    $('#periodcount').html(data.magaPrice.periodcount);
    $('#yearprice').html(data.magaPrice.yearprice);
    $('#unitprice').html(Math.round(data.magaPrice.yearprice / data.magaPrice.periodcount * 100) / 100);
}
// 推荐阅读
function createPeriodRecommendDom(list) {
    if (list && list.length > 0) {
        var periodRecommendStr = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var organizers = item.organizers ? item.organizers : '';
            var btnStr = '';
            if (item.bdhxf == 1) {
                btnStr += '<span class="sidebar-item-btn sidebar-btn-hexin">核心</span>';
            }
            if (item.isyx == 1) {
                btnStr += '<span class="sidebar-item-btn sidebar-btn-yx">优先</span>';
            }
            var src = 'http://c61.cnki.net/CJFD/big/' + item.code + '.jpg';
            periodRecommendStr += '<div class="single-sidebar-item clearfix"><a href="/detail/singlePeriodDetail/' + item.code + item.lastestyear + item.lastestperiod + '" target="_blank"><img src="' + item.coverpic + '" onerror="javascript:this.src=&apos;' + src + '&apos; ;this.onerror=null;" width="88" height="119"></a><div class="single-sidebar-main"><div class="sidebar-item-title"><a href="/detail/singlePeriodDetail/' + item.code + item.lastestyear + item.lastestperiod + '" target="_blank">' + item.name + '</a></div><div class="sidebar-item-intro">' + organizers + '</div><div class="sidebar-item-btns">' + btnStr + '</div></div></div>';

        }
        bookRecommendList.html(periodRecommendStr);
    }
}
// 整本期刊所有年份
function getPeriodYear(year) {
    var url = '/detail/getPeriodYear/' + magaCode;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var str = '';
                $.each(list, function(index, item) {
                    str += '<option value="' + item.year + '">' + item.year + '年</option>';
                });
                periodYear.html(str);
                periodYear.val(year);


            }
        }
    });
}
var flag = false;
// 获取该年份下的所有期数
function getPeriodListByYear(year, period) {
    var url = '/detail/getPeriodListByYear/' + magaCode + '?year=' + year;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var str = '';
                if (list.length == 0) {
                    str = '<option>暂无数据</option>';
                    return;
                }
                $.each(list, function(index, item) {
                    str += '<option value="' + item.period + '">' + item.period + '期</option>';
                });
                periodMonth.html(str);
                if (period) {
                    periodMonth.val(period);
                }
                if (flag) {
                    getPeriodCatalog(magaCode + year + list[0].period);
                    getSinglePeriodDetail(magaCode + year + list[0].period);
                }
            }
        }
    });
}
// 获取期刊目录
var isall = false;

function getPeriodCatalog(thname) {
    var html = "";
    var url = '/detail/getPeriodCatalog/' + thname;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                renderCatalog(list);
            }
        }
    });
}
//刊内搜索文献结果
function getLiteratureResult(pageNum) {
    var pageNum = pageNum || 1;
    var type = $('.catalog-input-type').val();
    var keyword = $('.catalog-input-search').val();
    var url = encodeURI('/detail/getLiteratureResult?thname=' + thname + '&' + type + '=' + keyword + '&pageNum=' + pageNum);
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                renderCatalog(list, keyword);
            }
        }
    });
}

function renderCatalog(list, keyword) {
    console.log(list)
    if (list.length <= 0) {
        $("#catelog").html('暂无数据');
        $(".catalog-more").hide();
    } else {
        var sectionindex = 0;
        var map = {},
            result = [];
        $.each(list, function(index, item) {
            if (!map[item.Level]) {
                result.push({
                    Level: item.Level,
                    data: [item]
                });
                map[item.Level] = item;
            } else {
                for (var j = 0; j < result.length; j++) {
                    var dj = result[j];
                    if (dj.Level == item.Level) {
                        dj.data.push(item);
                        break;
                    }
                }
            }

        });
        var icount = 1;
        var html = '';
        for (var i = 0; i < result.length; i++) {
            if (result[i].Level != "" && result[i].Level != null) {
                icount++;
                html += '<li class="catalog-item">' + result[i].Level + '</li>';
            }
            for (var j = 0; j < result[i].data.length; j++) {
                icount++;
                var author = result[i].data[j].Author || '--';
                var pages = result[i].data[j].Page || '--';
                var filename = result[i].data[j].FileName;
                if (filename.indexOf('~#@') != -1 && filename.indexOf('@#~') != -1) {
                    filename = filename.replace(/~#@/g, '');
                    filename = filename.replace(/@#~/g, '');
                }
                html += '<li class="catalog-subitem clearfix"><a href="/literature/literatureDetail?filename=' + filename + '&dbType=' + result[i].data[j].DBName.substring(0, 4) + '" target="_blank"><span class="catalog-subitem-title">' + $.kd.keywordStyleRed(result[i].data[j].Title, '~#@', '@#~', keyword) + '</span><span class="catalog-subitem-author">' + author + '</span><span class="catalog-subitem-page">' + pages + '</span></a></li>';
                if (icount == 21) {
                    html += "<a href=\"javascript:;\" class=\"catalog-more\" id=\"more\">查看更多<img src=\"/images/bookstore/bookstore11.png\"></a>";
                    html += "<div id=\"hiddensecion\" style=\"display:none\">";
                }
            }
            // if (icount == 21) {
            //     html += "<a href=\"javascript:;\" class=\"catalog-more\" id=\"more\">查看更多<img src=\"/images/bookstore/bookstore11.png\"></a>";
            //     html += "<div id=\"hiddensecion\">";
            // }

        }
        if (icount > 21) {
            html += "</div>";
            html += "<a href=\"javascript:;\" class=\"catalog-more\" id=\"nomore\" style=\"display:none\">收起目录<img src=\"/images/bookstore/bookstore19.png\"></a>";
        }
        $("#catelog").html(html);
        bind();
    }
}
// 目录展开收起
function bind() {
    $('.catalog-more').click(function() {
        if (isall == false) {
            isall = true;
            $("#more").hide();
            $("#nomore").show();
            $("#hiddensecion").show();
        } else {
            isall = false;
            $("#nomore").hide();
            $("#more").show();
            $("#hiddensecion").hide();
        }
    });
}

// 年切换
periodYear.on('change', function() {
    flag = true;
    var year = $(this).val();
    getPeriodListByYear(year);
});
// 刊期切换
periodMonth.on('change', function() {
    var year = periodYear.val();
    var period = $(this).val();
    getPeriodCatalog(magaCode + year + period);
    getSinglePeriodDetail(magaCode + year + period);
});

$('.catalog-tab:eq(1)').click(function() {
    window.open('/detail/periodDetail/' + magaCode, '_target');
});

// 下载
$('#downloadBtn').click(function() {
    var title = $('.periodical-title').html();
    layer.open({
        type: 1,
        skin: 'layer1',
        title: ['温馨提示'],
        closeBtn: 1,
        area: ['472px', '262px'],
        shadeClose: true,
        resize: false,
        btn: ['确定'],
        btnAlign: 'c',
        content: '<p>您尚未订购《' + title + '》<br>请先购买再下载!</p>'
    });
});
// 搜索
var searchBtn = $('#literatureSearchBtn');
searchBtn.on('click', function() {
    var keyword = $(this).siblings('input').val();
    if (keyword.trim().length == 0) {
        getPeriodCatalog(thname);
        return;
    }
    getLiteratureResult();
});
var collectBtn = $('.periodical-collect');
collectBtn.click(function() {
    var username = $('#username').val();
    if (username == '' || username == 'undefined') {
        // layer.msg('请先登录后才能收藏');
        location.href = '/userCenter/login';
        return;
    };
    var id = periodInfo.attr('data-id');
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        cancelCollect(id);
    } else {
        $(this).addClass('active');
        addCollect(id);
    }
});

function addCollect(id) {
    var url = '/common/addCollect/' + id + '?typeid=4';
    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        success: function(response) {
            if (response.code == 0) {
                if (response.data.status == 1) {
                    layer.msg(response.data.info);
                    collectBtn.addClass('active');

                }
            }
        }
    });
}

function cancelCollect(id) {
    var url = '/common/cancelCollect/' + id + '?typeid=4';
    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        success: function(response) {
            if (response.code == 0) {
                if (response.data.status == 0) {
                    layer.msg(response.data.info);
                    collectBtn.removeClass('active');
                }
            }
        }
    });
}