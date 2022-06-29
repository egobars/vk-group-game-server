var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.json({a: 1});
});

module.exports = router;
