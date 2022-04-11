const Router = require('express');
const router = new Router();
const brandController = require('../controllers/brandController');

router.get('/getBrands', brandController.getBrands);

module.exports = router;
