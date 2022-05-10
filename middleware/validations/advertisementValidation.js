const {
  brandIdAdvertisement,
  categoryIdAdvertisement,
  descriptionAdvertisement,
  priceAdvertisement,
  titleAdvertisement,
} = require('./validations');

const advertisementCreate = [
  brandIdAdvertisement(),
  categoryIdAdvertisement(),
  descriptionAdvertisement(),
  priceAdvertisement(),
  titleAdvertisement(),
]

module.exports = {
  advertisementCreate,
}