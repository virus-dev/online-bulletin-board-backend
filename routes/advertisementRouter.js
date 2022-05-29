const Router = require('express');
const router = new Router();
const advertisementController = require('../controllers/advertisementController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { advertisementCreate } = require('../middleware/validations/advertisementValidation');

router.post('/create', advertisementCreate, authMiddleware, advertisementController.create);
router.post('/getAll', advertisementController.getAll);

router.put('/confirmModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.confirmModeration);
router.put('/disconfirmModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.disconfirmModeration);

router.get('/getAllOnModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.getAllOnModeration);
router.get('/getAllMyAdvertisement', authMiddleware, advertisementController.getAllMyAdvertisement);
router.get('/getOneOnModeration', checkRoleMiddleware(['ADMIN', 'MODERATOR']), advertisementController.getOneOnModeration);
router.get('/getCurrentAdvertisement', advertisementController.getCurrentAdvertisement);

router.get('/getOneMaybeNotPublic', authMiddleware, advertisementController.getOneMaybeNotPublic);
router.get('/getImagesMaybeNotPublic', authMiddleware, advertisementController.getImagesMaybeNotPublic);

router.get('/getImages', jwtMiddleware, advertisementController.getImages);
router.get('/getOne', advertisementController.getOne);

module.exports = router;
