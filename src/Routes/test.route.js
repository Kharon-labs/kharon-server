let express = require('express');
let testController = require('../Controllers/test.controller');

router = express.Router();

router.route('/')
    .get(testController.getTestResponse);


module.exports = router;