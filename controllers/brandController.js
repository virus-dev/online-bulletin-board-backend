const ApiError = require('../errors/ApiError');
const { Brands } = require('../models/models');

class BrandsController {
  async getBrands(req, res, next) {
    try {
      const brands = await Brands.findAll();
      return res.json(
        brands.map(({ id, name }) => ({ id, name }))
      );
    } catch (e) {
      console.log(e.response)
      return ApiError.badRequest('Все плохо');
    }
  }
}

module.exports = new BrandsController();
