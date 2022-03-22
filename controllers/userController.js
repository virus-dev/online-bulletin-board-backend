const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');
const { User } = require('../models/models');

const generateJWT = (id, email, role) => jwt.sign(
  { id, email, role },
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
      const token = generateJWT(user.id, email, user.role);
      return res.json({ token });
    } catch (e) {
      console.log('Что-то пошло не так', e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.internal('Пользователь с таким именем не найден'));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal('указан неверный пароль'));
      }

      const token = generateJWT(user.id, user.email, user.role);
      return res.json({ token });
    } catch(e) {
      console.log('Что-то пошло не так', e);
    }
  }
}

module.exports = new UserController();