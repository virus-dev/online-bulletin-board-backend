const { validationResult } = require('express-validator');

const validationCheck = (req, res) => {
  const { errors } = validationResult(req);

  if (errors.length) {
    const resJson = errors.map(({ msg, param }) => ({
      msg, param
    }));

    return res.status(404).json(resJson);
  }
}

module.exports = {
  validationCheck,
}
