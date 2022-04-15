const { default: axios } = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');
const { User } = require('../models/models');
const FormData = require('form-data');
const fs = require('fs');
const jwtDecode = require('jwt-decode');
const imgbbUploader = require("imgbb-uploader");
const { checkFileForImgBB } = require('../utils/getCheckFileFunc');
const { validationCheck } = require('../errors/validationCheck');

const generateJWT = (email) => {
  return jwt.sign(
    { email },
    process.env.SECRET_KEY,
    { expiresIn: '24h' },
  )
};

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
      const token = generateJWT(user.email);
      return res.json({ 
        token, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        secondName: user.secondName, 
        phone: user.phone, 
        image: user.image
      });
    } catch (e) {
      console.log('Что-то пошло не так', e);
    }
  }

  async login(req, res, next) {
    try {
      validationCheck(req, res);

      const { email, password } = req.body;

      console.log(email, password)
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.badRequest('Пользователь с таким именем не найден'));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.badRequest('указан неверный пароль'));
      }

      const token = generateJWT(user.email);
      return res.json({ 
        token, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        secondName: user.secondName, 
        phone: user.phone, 
        image: user.image
      });
    } catch(e) {
      console.log(e)
      return ApiError.badRequest('Все плохо');
    }
  }

  async update(req, res, next) {
    let imgRes;
    try {
      const { file, file: { data } } = req.files;

      if (!file) {
        return next(ApiError.badRequest('Файл не загрузился'));
      }

      if (!checkFileForImgBB(file)) {
        return next(ApiError.newBadRequest(res, 'Файл не прошел валидацию'));
      }
      const {
        email,
      } = req.user;

      if (!email) {
        return ApiError.badRequest('Нет пользователя');
      }

      const user = await User.findOne({
        where: { email }
      })

      const formData = new FormData();
      formData.append('image', data.toString('base64'))

      const headers = {
        ...formData.getHeaders(),
        'access-control-allow-headers': 'Cache-Control, X-Requested-With, Content-Type',
        'access-control-allow-methods': 'POST, GET, OPTIONS',
        'access-control-allow-origin': 'https://online-bulletin-board-frontend.herokuapp.com/',
      };

      imgRes = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMG_BB_API}`, formData, {
        headers,
      });

      if (imgRes.data.status !== 200) {
        return next(ApiError.badRequest('Картинка не загрузилать на хостинг'));
      }

      await user.update({ image: imgRes.data.data.url });

      const token = generateJWT(user.email);

      return res.json({ 
        token, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        secondName: user.secondName, 
        phone: user.phone, 
        image: user.image
      });
    } catch (e) {
      return res.json(e)
      return ApiError.serverError(e.response);
    }
  }

  async getData(req, res, next) {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const {
        email
      } = jwtDecode(token)

      const user = await User.findOne({ where: { email } });

      return res.json({
        email: user.email, 
        role: user.role,
        firstName: user.firstName, 
        secondName: user.secondName, 
        phone: user.phone, 
        image: user.image,
      })
    } catch (e) {
      console.log(e.response)
      return ApiError.badRequest('Все плохо');
    }
  }
}

module.exports = new UserController();
