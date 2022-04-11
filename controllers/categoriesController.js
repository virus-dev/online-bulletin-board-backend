const ApiError = require('../errors/ApiError');
const { Categories } = require('../models/models');

class CategoriesController {
  async getCategories(req, res, next) {
    try {
      const categories = await Categories.findAll();
      return res.json(
        categories.map(({ id, name }) => ({ id, name }))
      );
    } catch (e) {
      console.log(e.response)
      return ApiError.badRequest('Все плохо');
    }
  }
}

module.exports = new CategoriesController();
