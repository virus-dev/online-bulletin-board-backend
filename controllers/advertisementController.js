const { Op } = require('sequelize');
const { default: axios } = require('axios');
const ApiError = require('../errors/ApiError');
const { Categories, User, Advertisement, AdvertisementImages } = require('../models/models');
const FormData = require('form-data');
const { options } = require('pg/lib/defaults');
const { validationCheck } = require('../errors/validationCheck');
const { response } = require('express');

const uploadImage = async ({ data }) => {
  const formData = new FormData();
  formData.append('image', data.toString('base64'));

  const imgRes = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMG_BB_API}`, formData, {
    headers: formData.getHeaders(),
  });

  return imgRes.data.data.url;
};

class AdvertisementController {
  async create(req, res, next) {
    try {
      validationCheck(req, res);

      const { files } = req;

      const {
        price,
        categoryId,
        brandId,
        title,
        description,
      } = req.body;

      if (!price || !categoryId || !brandId || !title || !description) {
        return ApiError.badRequest('Не все данные');
      }

      const {
        email,
      } = req.user;

      if (!email) {
        return ApiError.badRequest('Нет пользователя');
      }

      const { id } = await User.findOne({ where: { email } });

      if (!id) {
        return ApiError.badRequest('Пользователь не найден');
      }

      const advertisement = await Advertisement.create({
        userId: id,
        title,
        categoryId: Number(categoryId),
        price: Number(price),
        brandId: Number(brandId),
        status: 'moderation',
        description,
      })

      if (files) {
        const { file } = files;

        if (Array.isArray(file)) {
          for (let i = 0; i < file.length; i++) { 
            const imageUrl = await uploadImage(file[i]);
            await AdvertisementImages.create({
              advertisementId: advertisement.id,
              imageUrl,
            })
          }
        } else {
          const imageUrl = await uploadImage(file);
          await AdvertisementImages.create({
            advertisementId: advertisement.id,
            imageUrl,
          })
        }
      }

      return res.json({ message: 'norm' });
    } catch (e) {
      console.log(e.response);
      return ApiError.badRequest('Что-то пошло не так');
    }
  }

  async getAll(req, res, next) {
    try {
      let { brandId, categoryId, limit, page, sort } = req.query;
      const { title } = req.body;
      page = page || 1;
      limit = limit || 9;
      const offset = page * limit - limit;
      const [field, orderBy = 'DESC'] = sort.split('.');

      const options = {
        limit,
        offset,
        where: {
          ...(!!Number(brandId) ? { brandId } : {}),
          ...(!!Number(categoryId) ? { categoryId } : {}),
          ...(title ? { title: { [Op.iLike]: `%${title}%` } } : {}),
          status: 'open',
        },
        order: [[field || 'updatedAt', orderBy]],
      };

      const advertisement = await Advertisement.findAll(options);

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getCurrentAdvertisement(req, res, next) {
    try {
      let {
        brandId,
        categoryId,
        limit,
        page,
        advertisementsViewed,
      } = req.query;

      if (!advertisementsViewed) {
        return ApiError.normalBadRequest(res, 'Некорректные данные');
      }

      page = page || 1;
      limit = limit || 9;

      const optionsWhere = {
        ...(!!Number(brandId) ? { brandId } : {}),
        ...(!!Number(categoryId) ? { categoryId } : {}),
        status: 'open',
      }

      const newAdvertisementsViewed = advertisementsViewed.split(',');
      const promiseArr = newAdvertisementsViewed.splice((page - 1) * limit, limit).map(id => (
        Advertisement.findOne({ where: { ...optionsWhere, id } })
      ));

      const PromiseAll = await Promise.all(promiseArr);

      return res.status(200).json(PromiseAll.filter(Boolean));
    } catch (e) {
      return ApiError.newServerError(res);
    }
  }

  async getAllMyAdvertisement(req, res, next) {
    try {
      const {
        email,
      } = req.user;

      const user = await User.findOne({ where: { email } });

      const options = {
        where: {
          userId: user.id,
        },
        order: [['updatedAt', 'DESC']],
      };

      const advertisement = await Advertisement.findAll(options);

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getImages(req, res, next) {
    try {
      const { advertisementId } = req.query;

      const advertisement = await Advertisement.findOne({ where: { id: advertisementId } });

      const advertisementImages = await AdvertisementImages.findAll({ where: { advertisementId } });
      const advertisementImagesRes = advertisementImages.map(({ imageUrl }) => imageUrl);

      if (advertisement.status === 'open') {
        return res.json(advertisementImagesRes);
      }

      const {
        email,
        role
      } = req.user;

      const user = await User.findOne({ where: { email } });

      if (user.id === advertisement.userId) {
        return res.json(advertisementImagesRes);
      }

      if (['ADMIN', 'MODERATOR'].includes(role)) {
        return res.json(advertisementImagesRes);
      }

      return res.json();
    } catch (e) {
      console.log(e)
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getImagesMaybeNotPublic(req, res, next) {
    try {
      const { advertisementId } = req.query;

      const advertisement = await Advertisement.findOne({ where: { id: advertisementId } });

      const advertisementImages = await AdvertisementImages.findAll({ where: { advertisementId } });
      const advertisementImagesRes = advertisementImages.map(({ imageUrl }) => imageUrl);

      if (advertisement.status === 'open') {
        return res.json(advertisementImagesRes);
      }
      
      const {
        email,
      } = req.user;

      const user = await User.findOne({ where: { email } });

      if (user.id === advertisement.userId) {
        return res.json(advertisementImagesRes);
      }

      if (['ADMIN', 'MODERATOR'].includes(user.role)) {
        return res.json(advertisementImagesRes);
      }

      return;
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getOne(req, res, next) {
    try {
      let { id } = req.query;

      const advertisement = await Advertisement.findOne({ where: { id, status: 'open' } });

      if (!advertisement) {
        return;
      }

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getOneMaybeNotPublic(req, res, next) {
    try {
      let { id } = req.query;

      let advertisementPublic = await Advertisement.findOne({ where: { id, status: 'open' } });

      if (advertisementPublic) {
        return res.json(advertisementPublic);
      }

      const {
        email,
        role,
      } = req.user;

      if (['ADMIN', 'MODERATOR'].includes(role)) {
        const advertisement = await Advertisement.findOne({ where: { id } });
        return res.json(advertisement);
      }

      if (email) {
        const user = await User.findOne({ where: { email } });
        const advertisement = await Advertisement.findOne({ where: { id, userId: user.id } });

        if (advertisement) {
          return res.json(advertisement);
        }
      }

      return;
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getOneOnModeration(req, res, next) {
    try {
      let { id } = req.query;

      const advertisement = await Advertisement.findOne({ where: { id, status: 'moderation' }, order: [[ 'updateAt', 'DESC' ]], });

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async getAllOnModeration(req, res, next) {
    try {
      let { limit, page } = req.query;
      page = page || 1;
      limit = limit || 9;
      const offset = page * limit - limit;

      const advertisement = await Advertisement.findAll({ limit, offset, where: { status: 'moderation' } });

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async confirmModeration(req, res, next) {
    try {
      const { advertisementId } = req.body;
      
      const advertisement = await Advertisement.findOne({ where: { id: advertisementId } });
      await advertisement.update({ status: 'open' });

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }

  async disconfirmModeration(req, res, next) {
    try {
      const { advertisementId } = req.body;
      
      const advertisement = await Advertisement.findOne({ where: { id: advertisementId } });
      await advertisement.update({ status: 'close' });

      return res.json(advertisement);
    } catch (e) {
      return res.status(500).json({ message: 'что-то пошло не так' });
    }
  }
}

module.exports = new AdvertisementController();
