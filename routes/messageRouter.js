const Router = require('express');
const router = new Router();
const messageController = require('../controllers/messageController');
const { sendMessageRouterValidations } = require('../middleware/validations/messageRouterValidation');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/getCountUnreadMessages', authMiddleware, messageController.getCountUnreadMessages);
router.get('/getDialogs', authMiddleware, messageController.getDialogs);
router.get('/getChat', authMiddleware, messageController.getChat);

router.post('/sendMessage', authMiddleware, ...sendMessageRouterValidations, messageController.sendMessage);

router.put('/readMessage', authMiddleware, messageController.readMessage);

module.exports = router;
