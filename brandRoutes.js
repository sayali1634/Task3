const express = require('express');
const router = express.Router();
const brandCtrl = require('../controllers/brandController');

router.get('/', brandCtrl.getAllBrands);

module.exports = router;
