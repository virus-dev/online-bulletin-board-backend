const Router = require('express');
const router = new Router();
const advertisementController = require('../controllers/advertisementController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.post('/create', authMiddleware, advertisementController.create);

router.put('/confirmModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.confirmModeration);
router.put('/disconfirmModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.disconfirmModeration);

router.get('/getAllOnModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.getAllOnModeration);
router.get('/getOneOnModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.getOneOnModeration);

router.get('/getOneMaybeNotPublic', authMiddleware, advertisementController.getOneMaybeNotPublic);
router.get('/getImagesMaybeNotPublic', authMiddleware, advertisementController.getImagesMaybeNotPublic);

router.get('/getImages', jwtMiddleware, advertisementController.getImages);
router.get('/getAll', advertisementController.getAll);
router.get('/getOne', advertisementController.getOne);

module.exports = router;
