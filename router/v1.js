
const express = require('express');
const router = express.Router();

//上报数据
const keepObserverApi_v1 = require('../api/v1/keepObserver.js')


router.use('/keepObserver',keepObserverApi_v1)



module.exports = router


