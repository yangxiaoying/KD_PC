'use strict';
$(function() {
    const url = decodeURI(location.href);
    const keyword = url.substr(url.indexOf('=') + 1);
    getCollection();
    // 0 全部 1 微刊 2好文 3音频 4视频 5图集 6看典号 7期刊 8 图书
    function getCollection() {
        const url = encodeURI('/search/getSearchResult?keyword=' + keyword);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { goodessaylist, articlelist, audiolist, bookllist, journallist, mircbooklist, orglist, picslist, videolist } = response.data;
                    // console.log(response.data);
                    createMicrobookDom(mircbooklist);
                    createGoodessayDom(goodessaylist);
                    createVideoDom(videolist);
                    createAudioDom(audiolist);
                    createPicslistDom(picslist);
                    createArticleDom(articlelist);
                    createPeriodDom(journallist);
                    createBookDom(bookllist);
                    createKdhDom(orglist);
                }
            }
        });
    }
    // 微刊
    function createMicrobookDom(mircbooklist) {
        let str = '';
        const { total, rows } = mircbooklist;
        if (rows && rows.length == 0) {
            $('.s1').hide();
            return;
        }
        $('.s1 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 3) {
                str += `<div class="li">
                            <div class="pic"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank"><img src="${rows[i].coverpic}" width="360" height="160"></a><div class="num"><span class="num1">${rows[i].childcollectioncount}</span><span class="num2">${rows[i].viewcount}</span></div></div>
                            <div class="name">
                                <span class="text"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword)}</a></span>
                            </div>
                            <div class="info"><a href="/kdh/home/${rows[i].orgid}" target="_blank" class="left"><img src="${rows[i].logopic}">${rows[i].orgname}</a><span class="right time">${$.kd.dateFormat(rows[i].submittime)}</span></div>
                        </div>`
            }
        }
        $('.s1 .ul').html(str)
    }
    // 图文
    function createGoodessayDom(goodessaylist) {
        let str = '';
        const { total, rows } = goodessaylist;
        if (rows && rows.length == 0) {
            $('.s2').hide();
            return;
        }
        $('.s2 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 3) {
                const iscollect = rows[i].iscollect;
                const active = iscollect ? 'active' : '';
                str += `<div class="li" data-id="${rows[i].id}">
                            <a href="/detail/workDetail?id=${rows[i].id}&mediatype=1" target="_blank"><img src="${rows[i].coverpic}"></a>
                            <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=1" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword)}</a></h2>
                            <p>${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', keyword)}</p>
                            <div class="bottom">
                                <span class="name left">${rows[i].author}</span>
                                <div class="num right">
                                    <a href="javascript:;" class="collect ${active} right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                </div>
                            </div>
                        </div>`
            }
        }
        $('.s2 .ul').html(str)
    }
    // 视频
    function createVideoDom(videolist) {
        let str = '';
        const { total, rows } = videolist;
        if (rows && rows.length == 0) {
            $('.s3').hide();
            return;
        }
        $('.s3 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 3) {
                str += `<div class="li">
                            <a href="/detail/workDetail?id=${rows[i].id}&mediatype=3" target="_blank"><img src="${rows[i].coverpic}"></a>
                            <span class="icon"></span>
                            <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=3" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword)}</a></h2>
                            <p>${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', keyword)}</p>
                            <div class="bottom">
                                <span class="name left">${rows[i].author}</span>
                                <div class="num right">
                                    <a href="javascript:;" class="collect right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                </div>
                            </div>
                        </div>`
            }
        }
        $('.s3 .ul').html(str)
    }
    // 音频
    function createAudioDom(audiolist) {
        let str = '';
        const { total, rows } = audiolist;
        if (rows && rows.length == 0) {
            $('.s4').hide();
            return;
        }
        $('.s4 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 4) {
                str += `<div class="li left">
                            <a class="img" href="/detail/workDetail?id=${rows[i].id}&mediatype=2" target="_blank"><img src="${rows[i].coverpic}"/></a>
                            <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=2" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword)}</a></h2>
                            <div class="bottom">
                                <span class="name left">${rows[i].author}</span>
                                <div class="num right">
                                    <a href="javascript:;" class="collect right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                </div>
                            </div>
                        </div>`
            }
        }
        $('.s4 .ul').html(str)
    }
    // 图集
    function createPicslistDom(picslist) {
        let str = '';
        const { total, rows } = picslist;
        if (rows && rows.length == 0) {
            $('.s5').hide();
            return;
        }
        $('.s5 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 4) {
                str += `<div class="li">
                            <a href="/detail/workDetail?id=${rows[i].id}&mediatype=4" target="_blank"><img src="${rows[i].coverpic}"></a>
                            <span class="icon"></span>
                            <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=4" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword)}</a></h2>
                            <p>${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', keyword)}</p>
                            <div class="bottom">
                                <span class="name left">${rows[i].author}</span>
                                <div class="num right">
                                    <a href="javascript:;" class="collect right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                </div>
                            </div>
                        </div>`
            }
        }
        $('.s5 .ul').html(str)
    }
    // 文献
    function createArticleDom(articlelist) {
        let str = '';
        const { total, rows } = articlelist;
        if (rows && rows.length == 0) {
            $('.s6').hide();
            return;
        }
        $('.s6 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 8) {
                let icon = '';
                if (rows[i].DownloadFlag == 'pdf') {
                    icon = 'pdf';
                } else {
                    icon = 'epub';
                }

                if (i % 2 == 0) {
                    str += `<div class="li left ${icon}">
                                <p class="p1"><a href="/literature/literatureDetail?filename=${rows[i].FileName}&dbType=${rows[i].DBName.substring(0,4)}" target="_blank">${$.kd.keywordStyleRed(rows[i].Title, '~#@', '@#~', keyword)}</a></p>
                                <p class="p2">${rows[i].Author}《${rows[i].PublishName}》;${rows[i].Year}年${rows[i].Period}期</p>
                            </div>`
                } else {
                    str += `<div class="li right ${icon}">
                                <p class="p1"><a href="/literature/literatureDetail?filename=${rows[i].FileName}&dbType=${rows[i].DBName.substring(0,4)}" target="_blank">${$.kd.keywordStyleRed(rows[i].Title, '~#@', '@#~', keyword)}</a></p>
                                <p class="p2">${rows[i].Author}《${rows[i].PublishName}》;${rows[i].Year}年${rows[i].Period}期</p>
                            </div>`
                }
            }
        }
        $('.s6 .ul').html(str);
    }
    // 期刊
    function createPeriodDom(journallist) {
        let str = '';
        const { total, rows } = journallist;
        if (rows && rows.length == 0) {
            $('.s7').hide();
            return;
        }
        $('.s7 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 5) {
                str += `<div class="li">
                            <a href="/detail/periodDetail/${rows[i].code}" target="_blank"><img src="${rows[i].coverpic}"/></a>
                            <p><a href="/detail/periodDetail/${rows[i].code}" target="_blank">${$.kd.keywordStyleRed(rows[i].name, '~#@', '@#~', keyword)}</a></p>
                        </div>`
            }
        }
        $('.s7 .ul').html(str)
    }
    // 图书
    function createBookDom(bookllist) {
        let str = '';
        const { total, rows } = bookllist;
        if (rows && rows.length == 0) {
            $('.s8').hide();
            return;
        }
        $('.s8 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 5) {
                str += `<div class="li">
                            <a href="/detail/bookDetail/${rows[i].sku}" target="_blank"><img src="${rows[i].coverpic}"></a> 
                            <p><a href="/detail/bookDetail/${rows[i].sku}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', keyword)}</a></p>
                        </div>`
            }
        }
        $('.s8 .ul').html(str)
    }
    // 看典号
    function createKdhDom(orglist) {
        let str = '';
        const { total, rows } = orglist;
        if (rows && rows.length == 0) {
            $('.s9').hide();
            return;
        }
        $('.s9 .title h1 i').html(total);
        for (let i = 0; i < rows.length; i++) {
            if (i < 5) {
                str += `<div class="li">
                            <a href="/kdh/home/${rows[i].orgid}" target="_blank" class="img left"><img src="${rows[i].logopic}"></a>
                            <div class="info left">
                                <p class="p1"><a href="/kdh/home/${rows[i].orgid}" target="_blank">${$.kd.keywordStyleRed(rows[i].orgname, '~#@', '@#~', keyword)}</a></p>
                                <p class="p2">${$.kd.keywordStyleRed(rows[i].memo, '~#@', '@#~', keyword)}</p>
                            </div>
                        </div>`
            }
        }
        $('.s9 .ul').html(str)
    }


    $('.section').on('click', '.collect', function() {
        var _this = $(this);
        var id = $(this).parents('.li').attr('data-id');

        function addCollect(id) {
            var url = '/common/addCollect/' + id;
            $.ajax({
                url: url,
                dataType: "json",
                type: "GET",
                success: function(response) {
                    if (response.code == 0) {
                        if (response.data.status == 1) {
                            $('.pop').show().html(response.data.info).fadeOut(2000)
                            _this.addClass('active');

                        }
                    }
                }
            });
        }

        function cancelCollect(id) {
            var url = '/common/cancelCollect/' + id;
            $.ajax({
                url: url,
                dataType: "json",
                type: "GET",
                success: function(response) {
                    if (response.code == 0) {
                        if (response.data.status == 0) {
                            $('.pop').show().html(response.data.info).fadeOut(2000)
                            _this.removeClass('active');
                        }
                    }
                }
            });
        }
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            cancelCollect(id);
        } else {
            $(this).addClass('active');
            addCollect(id);
        }
    })
})