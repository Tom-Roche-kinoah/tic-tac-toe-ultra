const express = require('express');
const router = express.Router();
const mainController = require('./mainController');
const apiController = require('./apiController');

router.get('/', mainController.index);

router.post('/api/login', apiController.loginPost);

module.exports = router;