const Router = require('express');
const router = new Router();
const advertisementController = require('../controllers/advertisementController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, advertisementController.create);

module.exports = router;
