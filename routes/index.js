const Router = require('express')
const userRouter = require('./userRouter');
const advertisementRouter = require('./advertisementRouter');
const categoriesRouter = require('./categoriesRouter');
const brandRouter = require('./brandRouter');
const messageRouter = require('./messageRouter');

const router = new Router();

router.use('/user', userRouter);
router.use('/advertisement', advertisementRouter);
router.use('/categories', categoriesRouter);
router.use('/brands', brandRouter);
router.use('/messages', messageRouter);

module.exports = router;