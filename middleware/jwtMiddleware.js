const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        next();
      }

      const token = authorization.split(' ')[1];
      if (!token || token === 'null') {
        return next();
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      req.user = decoded
      next()
    } catch (e) {
      res.status(500).json({message: "Что-то пошло не так"})
    }
};