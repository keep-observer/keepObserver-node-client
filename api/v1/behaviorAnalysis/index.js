

const {
    ajaxResult,
    ajaxFailResult
} = require('../../tool/index.js');

const simpleH5Analysis = require('./h5Analysis.js')
const webSignAnalyse = require('./webSignAnalyse.js')





const filterAnlysisRecord = function(req, res){
    var params = req.body;

    //判断访问域名是不是localhost
    var host = req.headers.host;
    var {location,reportType} = params;
    
    if (host.indexOf('localhost') < 0 && location.indexOf('localhost') > -1) {
        return false;
    }

    switch (reportType) {
        //简单H5页面上报处理
        case 'simpleH5': {
            simpleH5Analysis(req, res);
            return false;
        }

        //自动化配置埋点上报处理
        case 'webSignAnalyse': {
            webSignAnalyse(req, res);
            return false;
        }

        default: {
            ajaxFailResult(res, 'request reportType type is Error!')
            return false;
        }
    }
}

module.exports = filterAnlysisRecord