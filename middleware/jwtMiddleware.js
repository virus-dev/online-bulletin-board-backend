const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
      const { authorization } = req.headers;

      req.user = {};
      
      if (!authorization) {
        return next();
      }

      const token = authorization.split(' ')[1];
      if (!token || token === 'null') {
        return next();
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      req.user = decoded;
      return next()
    } catch (e) {
      return next()
    }
};