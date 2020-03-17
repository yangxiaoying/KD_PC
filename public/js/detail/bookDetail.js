// 'use strict';

var url = decodeURI(location.href);
var id = url.substr(url.lastIndexOf('/') + 1);
var bookImg = $('#book-img').find('.book-image');
var bookInfo = $('#bookInfo');
var bookDes = $('#bookDes');
var recommendWord = $('#recommendWord');
var authorDes = $('#authorDes');
var catalog = $('#catalog');
var bookRecommendList = $('#slide').find('.imageList');
var toggleBtn = $('.book-detail-more');
var bookCommentList = $('#bookCommentList');
var bookHotBankList = $('#bookHotBankList');
var loadingMore = $('#loadingMore');
var commentBtn = $('#commentBtn');
var commentInput = $('#commentInput');
var username = $('#username').val();
getBookHotBank();
getCommentList();
checkIVip();

var layer = '';
layui.use('layer', function() {
    layer = layui.layer;
});

function checkIVip() {
    var url = '/detail/checkVip';
    $.ajax({
        type: "GET",
        url: url, 
        dataType: "json",
        success: function(response) {
            if (response.errorcode == 1) {
                var isVip = response.rows;
                getBookDetail(isVip);
            }   
        }
    });
}

function getBookDetail(isVip) {
    var ismember = isVip == true ? 1 : 0;
    var url = '/detail/getBookDetail/' + id + '?ismember=' + ismember;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var bookrecommend = response.data.bookrecommend;
                var bookinfo = response.data.bookinfo;
                createBookInfoDom(response.data,isVip);
                createBookRecommendDom(bookrecommend);
                var code = bookinfo.sku;
                var title = bookinfo.title;
                var coverPic = bookinfo.coverpic;
                var price = $('.book-realprice').find('.realprice').html();
                // 购买
                $('#buyBtn1').click(function() {
                    location.href = encodeURI('/payment/checkout?code=' + code  + '&title=' + title + '&price=' + price + '&ordertype=' + 3 + '&coverPic=' + coverPic);
                });

            }
        }
    });
}

// 图书信息
function createBookInfoDom(data,isVip) {
    var bookinfo = data.bookinfo;
    var shopprice = data.shopprice;
    bookInfo.attr('data-id', bookinfo.sku);
    bookImg.attr('src', bookinfo.coverpic);
    bookInfo.find('.book-title').html(bookinfo.title);
    bookInfo.find('.book-des').html(bookinfo.adinfo ? bookinfo.adinfo : '');
    bookInfo.find('.book-author').html('<a>' + bookinfo.author + '</a>' + bookinfo.compiledtype);
    bookInfo.find('.book-publisher').html(bookinfo.publisher);
    bookInfo.find('.book-pubtime').html($.kd.dateFormat(bookinfo.pubtime));
    bookInfo.find('.isbn').html(bookinfo.isbn ? bookinfo.isbn : '--');
    bookInfo.find('.wordcount').html(bookinfo.wordcount ? bookinfo.wordcount : '--');
    bookDes.html(bookinfo.bookdes);
    // bookInfo.find('.book-price .realprice').html(bookinfo.realprice);
    if (bookinfo.iscollect == 0) {
        $('.book-collect').html('收藏');
    } else {
        $('.book-collect').html('已收藏').addClass('active');
    }

    // 推荐语
    if (bookinfo.recommendation) {
        recommendWord.html(bookinfo.recommendation);
    } else {
        recommendWord.prev('.book-title').hide();
    }
    // 作者
    if (bookinfo.authordes) {
        authorDes.html(bookinfo.authordes);
    } else {
        authorDes.prev('.book-title').hide();
        $('.main-nav-item:eq(1)').hide();
    }
    // 目录
    var catalogArr = '';
    var catalogStr = '';

    if (bookinfo.wonderfulbook) {
        catalogArr = JSON.parse(bookinfo.wonderfulbook);
    } else {
        catalog.prev('.book-title').hide();
    }

    for (var i = 0; i < catalogArr.length; i++) {
        var item = catalogArr[i];
        if (item.Grade == 1) {
            catalogStr += '<p class="book-catalog">' + item.Title + '</p>';
        } else {
            catalogStr += '<p class="book-catalog-sub">' + item.Title + '</p>';;
        }
    }
    catalog.html(catalogStr);

    // 目录作者展开收起
    var catalogHeight = catalog.height();
    var authorDesHeight = authorDes.height();
    if (catalogHeight > 450) {
        catalog.addClass('fold').next('.book-detail-more').show();

    }
    if (authorDesHeight > 210) {
        authorDes.addClass('fold').next('.book-detail-more').show();
    }
    toggleBtn.click(function() {
        if ($(this).prev('.contentBox').hasClass('fold')) {
            $(this).html('收起全部');
            $(this).prev('.contentBox').removeClass('fold');
        } else {
            $(this).html('查看全部');
            $(this).prev('.contentBox').addClass('fold');
        }
    });

    // // 下载
    $('#downloadBtn').click(function() {
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
            content: '<p>您尚未订购《' + bookinfo.title + '》<br>请先购买再下载!</p>'
        });
    });
    // 分享
    var shareText = '书刊《' + bookinfo.title + '》来购买吧！';
    // var SetShareUrl = 'http://kandian.cnki.net/web/m/book/detail/' + bookinfo.sku;
    var SetShareUrl = window.location.href;
    // 注意要记得设置onBeforeClick事件， 用于获取动态的文章ID
    window._bd_share_config = {
        common: {
            onBeforeClick: SetShareUrl,
            bdText: shareText,
            bdUrl: SetShareUrl,
        },
        share: [{
            'bdSize': 24
        }]
    };

    with(document) 0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5)];


    // 会员及促销活动

    // 倒计时
    function countDown(startTime,endTime,target) {
        var times = (endTime - startTime) / 1000;  
        if(target == '.book-activity-free' || target == '.book-vip-free'){
            $('.book-activity-free').show(); 
        }else if(target == '.book-activity-sale'){
            $('.book-activity-sale').show();            
        }
        setInterval(function() {      
           var countdown = $(target).find('.countdown');
           var d = parseInt(times / 60 / 60 / 24); 
           d = d < 10 ? '0' + d : d;
           countdown.find('.day').html(d);
           var h = parseInt(times / 60 / 60 % 24); 
           h = h < 10 ? '0' + h : h;
           countdown.find('.hour').html(h);
           var m = parseInt(times / 60 % 60); 
           m = m < 10 ? '0' + m : m;
           countdown.find('.minute').html(m);
           var s = parseInt(times % 60); 
           s = s < 10 ? '0' + s : s;
           countdown.find('.second').html(s);
           times = times - 1;
        },1000)
    }

    
   
    

    if(!isVip){
        // 非会员
        if(shopprice.isfree == 1){
            // 免费价  currenttime freeendtime  freestarttime      
            countDown(shopprice.currenttime,shopprice.freeendtime,'.book-activity-free'); 
            $('.book-realprice').show();
            $('.book-realprice').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价      
        }else if(shopprice.issale == 1){
            // 促销价 currenttime saleendtime  salestarttime
            countDown(shopprice.currenttime,shopprice.saleendtime,'.book-activity-sale');
            $('.book-realprice').show();
            $('.book-realprice').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价
            $('.book-realprice').find('.realprice').html(shopprice.saleprice); //促销价
            //VIP和促销若二选一则return
        }else{
            // 无免费和促销显示原价
            $('.book-realprice').show().find('.realprice').html(shopprice.price);
        }
        
        if(shopprice.memberisfree == 1){
            $('.book-vip-tip').show().find('span').html('开通VIP会员，该书尊享免费');
            return;
        }
        
        if(shopprice.memberisdiscount == 1){
            $('.book-vip-tip').show().find('span').html('开通VIP会员，该书尊享'+shopprice.memberdiscount*10+'折特惠');
            return;
        }
       
    }
    if(isVip){ 
        // 会员
        $('.book-vip-tip').hide(); 
        if(shopprice.memberisfree == 0 && shopprice.memberisdiscount == 0){    
            // 无会员优惠 
            if(shopprice.isfree == 1){    
                countDown(shopprice.currenttime,shopprice.freeendtime,'.book-activity-free'); 
                $('.book-realprice').show();
                $('.book-realprice').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价      
            }else if(shopprice.issale == 1){
                countDown(shopprice.currenttime,shopprice.saleendtime,'.book-activity-sale');
                $('.book-realprice').show();
                $('.book-realprice').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价
                $('.book-realprice').find('.realprice').html(shopprice.saleprice); //促销价
            }else{
                $('.book-realprice').show().find('.realprice').html(shopprice.price);
            }
        }
        if(shopprice.memberisfree == 1){
            // 会员免费                  
            $('.book-vip-free').show();
            $('.book-vip-free').find('.icon').css('display','inline-block'); // 尊享图标
            $('.book-vip-free').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价
        }
        if(shopprice.memberisdiscount == 1){
            if(shopprice.isfree == 1){            
                countDown(shopprice.currenttime,shopprice.freeendtime,'.book-activity-free');   
            }else if(shopprice.issale == 1){
                if(shopprice.memberdiscountprice <= shopprice.saleprice){
                    // 会员折扣价
                    $('.book-vip-sale').show();
                    $('.book-vip-sale').find('.icon').css('display','inline-block'); // 尊享图标
                    $('.book-vip-sale').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价   
                    $('.book-vip-sale').find('.realprice').html(shopprice.memberdiscountprice); // 折扣价
                }else{
                    // 促销活动价
                    countDown(shopprice.currenttime,shopprice.saleendtime,'.book-activity-sale');
                    $('.book-realprice').show();
                    $('.book-realprice').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价
                    $('.book-realprice').find('.realprice').html(shopprice.saleprice); //促销价
                }
            }else{
                // 会员折扣价
                $('.book-vip-sale').show();
                $('.book-vip-sale').find('.icon').css('display','inline-block'); // 尊享图标
                $('.book-vip-sale').find('.oldprice').css('display','inline-block').find('i').html(shopprice.price); //原价   
                $('.book-vip-sale').find('.realprice').html(shopprice.memberdiscountprice); // 折扣价
            }
        }
    }

}
// 推荐阅读
function createBookRecommendDom(list) {
    if (list && list.length > 0) {
        var bookRecommendStr = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            bookRecommendStr += '<li><div class="pic"><a href="/detail/bookDetail/' + item.sku + '" target="_blank"><img src="' + item.coverpic + '" width="91" height="128 " alt=" "></a></div><p><a href="/detail/bookDetail/' + item.sku + 'target="_blank">' + item.title.substr(0, 9) + '</a></p></li>';
        }
        bookRecommendList.html(bookRecommendStr);
        slide("#slide", 160, 2400, 400);
    } else {
        $('.suggest').hide();
    }
}
// 图书人气榜
function getBookHotBank() {
    var url = '/detail/getBookHotBank/';
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var bookllist = response.data.bookllist;
                var rows = bookllist.rows;
                if (rows && rows.length > 0) {
                    var bookHotBankStr = '';
                    for (var i = 0; i < rows.length; i++) {
                        var item = rows[i];
                        if (i > 2) {
                            var classNormal = 'sidebar-number-normal';
                        }
                        bookHotBankStr += '<a href="/detail/bookDetail/' + item.sku + '" target="_blank"                                       class="sidebar-item  clearfix"><div class="sidebar-number ' + classNormal + '">' + (i + 1) + '.</div><div class="sidebar-img "><img src="' + item.coverpic + '" alt=" "></div><div class="sidebar-text ">' + item.title + '</div></a>'
                    }
                    bookHotBankList.html(bookHotBankStr);
                }
            }
        }
    });
}

// 获取书评列表
function getCommentList(pageNum) {
    var pageNum = pageNum || 1;
    var url = '/detail/getCommentList/' + id + '?pageNum=' + pageNum;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var rows = response.data.rows;
                if (rows && rows.length > 0) {
                    var bookCommentStr = '';
                    for (var i = 0; i < rows.length; i++) {
                        var item = rows[i];
                        bookCommentStr += '<div class="book-comment-item"><div class="book-comment-top clearfix"><div class="comment-img"><img src="' + item.avatar + '" alt=""></div><div class="comment-name">' + item.nickname + '</div><div class="comment-time">' + $.kd.dateFormat(item.addtime) + '</div></div><div class="comment-text">' + item.memo + '</div></div>';
                    }
                    bookCommentList.append(bookCommentStr);
                } else {
                    if (clickcount == 1) {
                        loadingMore.hide();
                    } else {
                        loadingMore.html('没有更多了！');
                        flag = false;
                    }

                }

            }
        }
    });
}
// // 书评加载更多
var clickcount = 1;
var flag = true;
loadingMore.click(function() {
    if (flag) {
        clickcount++;
        getCommentList(clickcount)
    }

});

// 评论文本域输入
commentInput.on("keyup", function() {
    numChange($(this), ".comment-number i", 400);
});

function numChange(inputSelector, wordCountSelector, maxWord) {
    $(inputSelector).attr("maxlength", maxWord);
    var txtval = $.trim($(inputSelector).val());
    var strLen = txtval.length;
    if (strLen > maxWord - 10) {
        $(wordCountSelector).css("color", "red");
        if (strLen > maxWord) {
            $(inputSelector).val(txtval.substr(0, maxWord))
        }
    } else {
        txtval = txtval.replace(/\n/gi, "")
        $(wordCountSelector).css("color", "");
    }
    $(wordCountSelector).html(strLen);
}

// 评分
var score = 5;
layui.use(['rate'], function() {
    var rate = layui.rate;
    rate.render({
        elem: '#rate',
        value: 5,
        text: true,
        setText: function(value) {
            this.span.text(value + "分");
            score = value;
        }
    })
});
// 提交评论
commentBtn.click(function() {
    if (username == '' || username == 'undefined') {
        layer.msg("请登录后评论");
        return;
    };
    var commentText = commentInput.val();
    if (commentText.trim().length == 0) {
        layer.msg("请输入评论内容!");
        return;
    }
    if (commentText.trim().length >= 400) {
        layer.msg("评论内容超出字数限制!");
        return;
    }
    var loadingLayer = null;
    var url = '/common/commentSubmit/' + id;
    $.ajax({
        type: "get",
        url: url,
        data: {
            content: commentText,
            score: score,
            typeid: 2,
        },
        dataType: "json",
        beforeSend: function() {
            loadingLayer = layer.load(2, {
                shade: [0.6, '#fff']
            });
        },
        success: function(response) {
            if (response.code == 0) {
                commentInput.val('');
                $('.comment-number i').text(0);
                layer.msg("提交成功，等待审核后显示！");
            }
        },
        complete: function(XMLHttpRequest, textStatus) {
            if (loadingLayer != undefined && loadingLayer != null)
                layer.close(loadingLayer);
        }

    });
});
var collectBtn = $('.book-collect');
collectBtn.click(function() {
    if (username == '' || username == 'undefined') {
        location.href = '/userCenter/login';
        return;
    };
    var id = bookInfo.attr('data-id');

    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        cancelCollect(id);
    } else {
        $(this).addClass('active');
        addCollect(id);
    }
});

function addCollect(id) {
    var url = '/common/addCollect/' + id + '?typeid=5';
    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        success: function(response) {
            if (response.code == 0) {
                if (response.data.status == 1) {
                    layer.msg(response.data.info);
                    collectBtn.addClass('active').html('已收藏');

                }
            }
        }
    });
}

function cancelCollect(id) {
    var url = '/common/cancelCollect/' + id + '?typeid=5';
    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        success: function(response) {
            if (response.code == 0) {
                if (response.data.status == 0) {
                    layer.msg(response.data.info);
                    collectBtn.removeClass('active').html('收藏');
                }
            }
        }
    });
}
// 图书封面大图预览
var bookSmallImg = $('.book-smallimg');
var bookBigImg = $('.book-bigimg');
bookSmallImg.mouseenter(function() {
    $(this).siblings('book-bigimg').stop(true, true);
    //判断元素是否正处于动画状态，如果当前没有进行动画，则添加新动画
    if (bookBigImg.is(":animated") == false) {
        bookBigImg.fadeIn();
    }
});
$('.book-img').mouseleave(function() {
    bookBigImg.fadeOut(500);
});

// 标签点击定位
$('.main-nav-item').click(function() {
    var i = $(this).index();
    $(this).addClass('main-nav-item-select').siblings().removeClass('main-nav-item-select');
    var section = $('.book-detail').children('.section');
    $("html,body").stop(true).animate({
        "scrollTop": section.eq(i).offset().top - 6
    }, 1000);
});

var writeCommentOffsetTop = $('.book-detail .section:last-child').offset().top;

$('.book-write').click(function() {
    $('html,body').animate({
        'scrollTop': writeCommentOffsetTop
    }, 1000);
});
// 分享
$(".book-share").click(function() {
    if ($(".book-share-more ").is(":visible ")) {
        $(".book-share-more ").hide();
    } else {
        $(".book-share-more ").show();
    }
})