
getMallHomepage();
function getMallHomepage(cateid,pageNum) {
    var url = '/mall/getMallHomepage';
    $.ajax({
        type: "GET",
        url: url, 
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                for (var i = 0; i < response.data.length; i++) {
                    var code = response.data[i].sort;
                    switch (code) {
                        case 'LBT0100': //
                            var LBTData = response.data[i].value;  
                            break;
                        case 'BJD0100': // 书刊句典
                            var BJDData = response.data[i].value;  
                            break;
                        case 'WBD0100': // 本周必读-晨读
                            var WBDMData = response.data[i].value;  
                            break;
                        case 'WBD0200': // 本周必读-夜读
                            var WBDEData = response.data[i].value;  
                            break;
                        case 'NIE0100': // 新刊速递
                            var NIEData = response.data[i].value;  
                            break;
                        case 'NBF0100': // 新书抢先
                            var NBFData = response.data[i].value;  
                            break;
                        case 'BLR0100': // 书单推荐
                            var BLRData = response.data[i].value;  
                            break;
                        case 'HBL0100': // 热门书单
                            var HBLData = response.data[i].value;  
                            break;
                        case 'HST0100': // 热门分类
                            var HSTData = response.data[i].value;  
                            break;
                        case 'PER0100': // 期刊推荐
                            var PERData = response.data[i].value;  
                            break;
                        case 'BKR0100': // 图书推荐
                            var BKRData = response.data[i].value;  
                            break;
                        case 'KDH0100': // 看典号
                            var KDHData = response.data[i].value;  
                            break;
                    }
                }
                console.log(WBDMData);
                if (WBDMData && WBDMData.length > 0) {

                }
            }   
        }
    });
}