const Router = require('express')
const userRouter = require('../routes/userRouter');

const router = new Router();

router.use('/user', userRouter);

module.exports = router;