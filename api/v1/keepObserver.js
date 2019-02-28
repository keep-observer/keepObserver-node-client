const express = require('express');
const router = express.Router();

const {
    ajaxFailResult
} = require('../tool/index.js');


const filterAnlysisRecord = require('./behaviorAnalysis/index.js');
const insertMonitorDate = require('./monitorAnalysis/index.js');
const insertPerformanceDate = require('./performanceAnalysis/index.js');


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
        type,
        project,
        reportType,
    } = params

    if (!project || !reportType) {
        ajaxFailResult(res, 'report Project or reportType is undefined');
        return false;
    }

    switch (type) {
        //行为分析模块
        case 'analyse': {
            filterAnlysisRecord(req, res)
            return false;
        }

        //监控分析模块
        case 'monitor': {
            insertMonitorDate(res, params)
            return false;
        }

        //性能分析模块
        case 'performance': {
            insertPerformanceDate(res, params)
            return false;
        }

        //请求类型type错误
        default: {
            ajaxFailResult(res, 'request type is Error!')
            return false;
        }
    }
});



module.exports = router;
