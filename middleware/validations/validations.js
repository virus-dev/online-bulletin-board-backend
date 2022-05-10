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

const titleAdvertisement = () => check('title')
  .trim()
  .not()
  .isEmpty()
  .withMessage('Обязательное поле')
  .isLength({ min: 2, max: 64 })
  .withMessage('Длина может быть от 2 до 64 символов')

const categoryIdAdvertisement = () => check('categoryId')
  .not()  
  .isIn(['0'])
  .withMessage('Обязательное поле')

const brandIdAdvertisement = () => check('brandId')
  .not()  
  .isIn(['0'])
  .withMessage('Обязательное поле')

const priceAdvertisement = () => check('price')
  .not()
  .isEmpty()
  .withMessage('Обязательное поле')
  .custom((value) => value < 1000000000)
  .withMessage('Максимально возможная цена - 1 000 000 000');

const descriptionAdvertisement = () => check('description')
  .trim()
  .not()
  .isEmpty()
  .withMessage('Обязательное поле')
  .isLength({ min: 1, max: 255 })
  .withMessage('Максимальная длина описания - 255 символов');

module.exports = {
  email,
  password,
  firstName,
  message,
  brandIdAdvertisement,
  categoryIdAdvertisement,
  descriptionAdvertisement,
  priceAdvertisement,
  titleAdvertisement,
}