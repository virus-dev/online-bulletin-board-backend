const Router = require('express');
const router = new Router();
const categoriesController = require('../controllers/categoriesController');

router.get('/getCategories', categoriesController.getCategories);

module.exports = router;
