const tool = require('../../tool/index.js');
const v1_ModelSql = require('../../sql/sqlModel.js');




/*
	记录统计数据
 */
const statisticsRecord = function(params) {
    var recordData = {};
    //记录统计时间
    var reportTime = new Date();
    var month = reportTime.getMonth() + 1;
    var date = reportTime.getDate();
    month = month < 10 ? '0' + month : month;
    date = date < 10 ? '0' + date : date;
    reportTime = "" + reportTime.getFullYear() + month + date;
    reportTime = parseInt(reportTime)
    if (!reportTime) {
        return false;
    }
    var {
        isMonitorError,
        isPerformance,
        reportType,
        type
    } = params;
    type = type ? type : 'unknow';
    //统计参数
    recordData.reportTime = reportTime;
    recordData.project = params.project;
    //读取之前的数据
    var tableName = 'Admin_statistics_data';
    var filter = {
        $and: [{
            reportTime: reportTime
        }, {
            project: params.project
        }]
    };
    //查询更新
    v1_ModelSql.findOne({
        tableName: tableName,
        filter: filter
    }).then(function(result) {
        if (result) {
            recordData.count = result.count;
            //处理计数
            if (result.count[type] && result.count[type][reportType] && tool.isNumber(result.count[type][reportType])) {
                var count = result.count[type][reportType]
                recordData.count[type][reportType] = count + 1;
            } else {
                if (!recordData.count[type]) {
                    recordData.count[type] = {};
                }
                recordData.count[type][reportType] = 1;
            }
            //更新统计数据
            v1_ModelSql.updateOne({
                tableName: tableName,
                filter: filter,
                data: {
                    $set: {
                        count: recordData.count
                    }
                }
            }).then(function() {}, function(err) {
                tool.handleErrorLog("更新" + recordData.project + ":" + "统计失败！" + err)
            })
        } else {
            recordData.count = {}
            recordData.count[type] = {};
            recordData.count[type][reportType] = 1;
            //不存在插入一条新数据
            v1_ModelSql.insertOne({
                tableName: tableName,
                data: recordData
            }).then(function() {}, function(err) {
                tool.handleErrorLog("创建" + recordData.project + ":" + "统计失败！" + err)
            })
        }
    }, function(err) {
        tool.handleErrorLog("查询" + recordData.project + ":" + "统计失败！" + err)
    });
}



module.exports = {
    statisticsRecord
}