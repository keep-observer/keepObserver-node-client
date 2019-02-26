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

const {
    filterWebObserverRecord,
    webPageviewFilterRecord
} = require('./webObserverAnalysis');

const tool = require('../../tool/index');

const v1_ModelSql = require('../../sql/sqlModel.js');



//用户上报数据接口
router.use('/report', (req, res) => {
    var params = req.body;
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
        //判断访问域名是不是localhost
        var host = req.headers.host
        var location = params.location
        if (host.indexOf('localhost') < 0 && location.indexOf('localhost') > -1) {
            return false;
        }
        switch (reportType) {
            case 'simpleH5': {
                filterAnlysisRecord(req, res, params);
                return false;
            }
            case 'webObserver': {
                //根据请求的data的type类型确定：  load:页面加载请求配置页面;     catch：数据上传捕获
                var { data } = params;
                if(data.type === 'load'){
                    webPageviewFilterRecord(req,res,params)
                }else if(data.type === 'catch'){
                    filterWebObserverRecord(req,res,params)
                }else{
                    ajaxFailResult(res, 'request data type is Error!')
                }
                return false;
            }
            default: {
                ajaxFailResult(res, 'request reportType type is Error!')
                return false;
            }
        }  
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


module.exports = router;
