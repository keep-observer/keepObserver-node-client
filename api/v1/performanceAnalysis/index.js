
const {
    ajaxResult,
    ajaxFailResult
} = require('../../tool/index.js');

const ModelSql = require('../../../sql/sqlModel.js');

const updateStatisticsRecord = require('../commonServer/updateStatisticsRecord.js')

const insertPerformanceDate = function(res, params){
    if (!params) {
        ajaxFailResult(res, "record params Can't be sure");
        return false;
    }
    var random = Math.floor(Math.random() * 10 + 1) * 30;
    //数据库写入记录
    ModelSql.insertOne({
        tableName: 'Admin_performance_data',
        data: params
    }).then(function(result) {
        //记录下统计
        setTimeout(function() {
            updateStatisticsRecord(params)
        }, random);
        //返回成功
        ajaxResult(res, null, "report content record Success");
    }, function(err) {
        ajaxFailResult(res, 'record fail error info:' + err)
    })
}

module.exports = insertPerformanceDate