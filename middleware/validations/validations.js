const { check } = require('express-validator');

const email = () => check('email')
  .trim()
  .isEmail()
  .withMessage('Не email')
  .isLength({ min: 5, max: 64 })
  .withMessage('Длина может быть от 5 до 64 символов')

const password = () => check('password')
  .trim()
  // .isLength({ min: 5, max: 64 })
  // .withMessage('Длина может быть от 5 до 64 символов')

module.exports = {
  email,
  password,
}