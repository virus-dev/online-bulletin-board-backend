const { default: axios } = require('axios');
const ApiError = require('../errors/ApiError');
const { Categories, User, Advertisement, AdvertisementImages } = require('../models/models');
const FormData = require('form-data');

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
      const { file } = req.files;

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

      if (!email) {
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

      return res.json({ message: 'norm' });
    } catch (e) {
      console.log(e.response);
      return ApiError.badRequest('Что-то пошло не так');
    }
  }
}

module.exports = new AdvertisementController();
