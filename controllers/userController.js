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

const generateJWT = (email, role) => {
  return jwt.sign(
    { email, role },
    process.env.SECRET_KEY,
    { expiresIn: '24h' },
  )
};

class UserController {
  async registration(req, res, next) {
    try {
      validationCheck(req, res);

      const { email, password, firstName } = req.body;
      if (!email || !password || !firstName) {
        return next(ApiError.notFound(res));
      }

      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.conflict(res, 'Пользователь с таким email уже существует'))
      }

      const hashPassword = await bcrypt.hash(password, 3);
      const user = await User.create({ email, password: hashPassword, firstName });
      const token = generateJWT(user.email, user.role);
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
      return next(ApiError.newServerError(res));
    }
  }

  async login(req, res, next) {
    try {
      validationCheck(req, res);

      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return next(ApiError.newBadRequest(res, 'Пользователь с таким именем не найден'));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.newBadRequest(res, 'Указан неверный пароль'));
      }

      const token = generateJWT(user.email, user.role);
      return res.json({
        token, 
        id: user.id,
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

      const token = generateJWT(user.email, user.role);

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
        id: user.id,
        email: user.email, 
        role: user.role,
        firstName: user.firstName, 
        secondName: user.secondName, 
        phone: user.phone, 
        image: user.image,
      })
    } catch (e) {
      return ApiError.badRequest('Все плохо');
    }
  }

  async getDataById(req, res, next) {
    try {
      const { id } = req.query;

      if (!id) {
        return ApiError.newBadRequest(res, 'Не хватает данных');
      }

      const user = await User.findOne({ where: { id } });

      if (!user) {
        return ApiError.newBadRequest(res, 'Пользователь не найден');
      }

      return res.json({ id, role: user.role, firstName: user.firstName, secondName: user.secondName, image: user.image });
    } catch (e) {
      return ApiError.newBadRequest(res, e);
    }
  }
}

module.exports = new UserController();
