const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { registrationRouterValidations } = require('../middleware/validations/userValidation');

router.post('/registration', registrationRouterValidations, userController.registration);
router.post('/login', userController.login);
router.post('/update', authMiddleware, userController.update);
router.get('/getData', authMiddleware, userController.getData);
router.get('/getDataById', userController.getDataById);

module.exports = router;
