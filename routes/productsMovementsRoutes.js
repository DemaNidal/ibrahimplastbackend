const express = require('express');
const router = express.Router();
const { addMovement, getMovementsByProduct } = require('../controllers/productsMovementsController');

router.post("/", addMovement);
router.get("/:productId", getMovementsByProduct);
module.exports = router;