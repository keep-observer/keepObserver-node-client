const express = require('express');
const router = express.Router();

var http = require('http');
var util = require('util');

const {
    ajaxResult,
    ajaxFailResult
} = require('../tool/index.js');

const {
    statisticsRecord
} = require('./statisticsRecord.js');

const {
    filterAnlysisRecord
} = require('./h5Analysis');

const tool = require('../../tool/index');

const v1_ModelSql = require('../../sql/sqlModel.js');

const {
    reserveOrigins
} = require('../../config')



//用户上报数据接口
router.use('/report', (req, res) => {
    var params = req.body;
    // console.log(params)
    // console.log('\n')
    //如果出现错误
    if (!params) {
        ajaxFailResult(res, 'request params is undefined')
        return false;
    }
    //判断上报项目和上报类型
    var {
        isMonitorError,
        isPerformance,
        isAnalyse,
        project,
        reportType,
    } = params

    if (!project || !reportType) {
        ajaxFailResult(res, 'report Project or reportType is undefined');
        return false;
    }

    //统计分析
    if (isAnalyse) {

        const hostname = req.hostname;
        let skipFlag = true;
        reserveOrigins.forEach(origin => {
            hostname.indexOf(origin) > -1 && (skipFlag = false);
        })
        if (skipFlag) {
            ajaxFailResult(res, 'report has been filtered!');
            return;
        }

        var {
            data
        } = params
        if (!tool.isNumber(data.repeatCount) || !tool.isNumber(data.repeatCountAll)) {
            ajaxFailResult(res, 'repeatCount or repeatCountAll is not a number')
            return false;
        }
        for (var key in data.useActives) {
            if (!tool.isNumber(data.useActives[key].activeCount) || !tool.isNumber(data.useActives[key].activeCountAll)) {
                ajaxFailResult(res, 'activeCount or activeCount is not a number')
                return false;
            }
        }
        //判断访问域名是不是localhost
        var host = req.headers.host
        var location = params.location
        if (host.indexOf('localhost') < 0 && location.indexOf('localhost') > -1) {
            return false;
        }

        filterAnlysisRecord(res, params);
        return false;
    }

    //监控&性能分析
    var tableName = false;
    if (isMonitorError) {
        tableName = 'Admin_monitor_data'
    } else if (isPerformance) {
        tableName = 'Admin_performance_data'
    }
    if (!tableName) {
        ajaxFailResult(res, "record tableName Can't be sure");
        return false;
    }
    var random = Math.floor(Math.random() * 10 + 1) * 30;
    //数据库写入记录
    v1_ModelSql.insertOne({
        tableName: tableName,
        data: params
    }).then(function(result) {
        //记录下统计
        setTimeout(function() {
            statisticsRecord(params)
        }, random);
        //返回成功
        ajaxResult(res, null, "report content record Success");
    }, function(err) {
        ajaxFailResult(res, 'record fail error info:' + err)
    })
});





//查询埋点配置
router.use('/getPointConfig', (req, res) => {
    var params = req.body;
    console.log('url:',params);

    //如果出现错误
    if (!params || !params.url) {
        ajaxFailResult(res, 'request params is undefined')
        return false;
    }

    var filter = {
        url: params.url
    }
    v1_ModelSql.findOne({
        tableName: 'Buried_point_config',
        filter: filter
    }).then((result) => {
        //返回成功
        ajaxResult(res, result ? result.nodeList : [], "get pages config Success");
        return false;
    }, (err) => {
        ajaxFailResult(res, 'config fail error info:' + err)
        return false;
    })
})

module.exports = router;









// console.log('客户端请求的IP地址：', getClientIp(req).replace('::ffff:',''))
// getIpInfo(getClientIp(req).replace('::ffff:',''), function(err, msg) {
//     debugger
    
// })

// function getClientIp(req) {
//       return req.headers['x-forwarded-for'] ||
//       req.connection.remoteAddress ||
//       req.socket.remoteAddress ||
//       req.connection.socket.remoteAddress;
// };

 
// /**
//  * 根据 ip 获取获取地址信息
//  */
// function getIpInfo(ip, cb) {
//     var sina_server = 'http://ip.taobao.com/service/getIpInfo.php?ip=';
//     var url = sina_server + ip;
//     http.get(url, function(res) {
//         debugger
//         var code = res.statusCode;
//         if (code == 200) {
//             res.on('data', function(data) {
//                 console.log(333,JSON.parse(data))
//                 try {
//                     cb(null, JSON.parse(data));
//                 } catch (err) {
//                     cb(err);
//                 }
//             });
//         } else {
//             debugger
//             console.log(res)
//             cb({ code: code });
//         }
//     }).on('error', function(e) { 
//         debugger
//         console.log(e)
//         cb(e); 
//     });
// };
 
