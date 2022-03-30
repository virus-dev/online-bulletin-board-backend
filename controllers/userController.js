const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');
const { User } = require('../models/models');

const generateJWT = id => jwt.sign(
  { id },
  process.env.SECRET_KEY,
  { expiresIn: '24h' },
);

class UserController {
  async registration(req, res, next) {
    try {
      debugger
      console.log(req.body);
      const { email, password, role } = req.body;
      if (!email || !password) {
        return next(ApiError.badRequest('Некорректный email или пароль'));
      }

      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest('Пользователь с таким email уже существует'))
      }

      const hashPassword = await bcrypt.hash(password, 3);
      const user = await User.create({ email, role, password: hashPassword });
      const token = generateJWT(user.id);
      return res.json({ token, email, role: user.role, firstName: user.firstName, secondName: user.secondName, phone: user.phone });
    } catch (e) {
      console.log('Что-то пошло не так', e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.badRequest('Пользователь с таким именем не найден'));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.badRequest('указан неверный пароль'));
      }

      const token = generateJWT(user.id);
      return res.json({ token, email, role: user.role, firstName: user.firstName, secondName: user.secondName, phone: user.phone });
    } catch(e) {
      return ApiError.badRequest('Все плохо');
    }
  }
}

module.exports = new UserController();
