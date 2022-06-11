const { validationResult } = require('express-validator');
const ApiError = require('./ApiError');

const validationCheck = (req, res, next) => {
  const { errors } = validationResult(req);

  if (errors.length) {
    const resJson = errors.map(({ msg, param }) => ({
      msg, param
    }));

    return ApiError.normalBadRequest(res, resJson);
  }
}

module.exports = {
  validationCheck,
}
