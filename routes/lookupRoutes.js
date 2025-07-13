const express = require('express');
const router = express.Router();
const { getCategories, getColors, getCurrencies, getMadeFrom, getUnits, getUsages, getSizeUnits,getwarehouse } = require('../controllers/lookupController');

router.get('/categories', getCategories);
router.get('/colors', getColors);
router.get('/currencies', getCurrencies);
router.get('/madefrom', getMadeFrom);
router.get('/units', getUnits);
router.get('/usages', getUsages);
router.get('/size-units', getSizeUnits);
router.get('/warehouse', getwarehouse);

module.exports = router;
