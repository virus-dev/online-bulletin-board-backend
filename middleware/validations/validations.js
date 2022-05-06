const { check } = require('express-validator');

const email = () => check('email')
  .trim()
  .isEmail()
  .withMessage('Не email')

const password = () => check('password')
  .trim()
  .isLength({ min: 8, max: 64 })
  .withMessage('Длина может быть от 8 до 64 символов')

const firstName = () => check('firstName')
  .trim()
  .isLength({ min: 2, max: 32 })
  .withMessage('Длина может быть от 2 до 32 символов')

const message = () => check('message')
  .trim()
  .isLatLong({ max: 255 })
  .withMessage('Максимальная длина сообщения - 255 символов')

module.exports = {
  email,
  password,
  firstName,
  message,
}