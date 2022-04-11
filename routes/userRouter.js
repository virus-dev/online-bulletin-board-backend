const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginRouterValidations } = require('../middleware/validations/userValidation');

router.post('/registration', userController.registration);
router.post('/login', ...loginRouterValidations, userController.login);
router.post('/update', authMiddleware, userController.update);
router.get('/getData', authMiddleware, userController.getData);

module.exports = router;
