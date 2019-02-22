
const express = require('express');
const router = express.Router();

//route
const v1_router = require('./v1.js');



//v1版本
router.use('/v1', v1_router);






module.exports = router




