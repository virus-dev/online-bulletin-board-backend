const { check } = require('express-validator');

const email = () => check('email')
  .trim()
  .isEmail()
  .withMessage('Не email')

const password = () => check('password')
  .trim()
  .isLength({ min: 3, max: 64 })
  .withMessage('Длина может быть от 3 до 64 символов')

const message = () => check('message')
  .trim()
  .isLatLong({ max: 255 })
  .withMessage('Максимальная длина сообщения - 255 символов')

module.exports = {
  email,
  password,
  message,
}