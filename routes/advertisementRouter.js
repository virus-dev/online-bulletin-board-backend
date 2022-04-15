const Router = require('express');
const router = new Router();
const advertisementController = require('../controllers/advertisementController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, advertisementController.create);

router.get('/getImages', advertisementController.getImages);
router.get('/getAll', advertisementController.getAll);
router.get('/getOne', advertisementController.getOne);

module.exports = router;
