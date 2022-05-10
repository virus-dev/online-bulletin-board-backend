const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: "USER" },
  firstName: { type: DataTypes.STRING, require: true, defaultValue: 'Пользователь', allowNull: false },
  secondName: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING, defaultValue: null }
})

const Advertisement = sequelize.define('advertisements', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  brandId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'moderation', allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
})

const Categories = sequelize.define('categories', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true },
});

const Brands = sequelize.define('brands', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true },
  categoryId: { type: DataTypes.INTEGER },
});

const AdvertisementImages = sequelize.define('advertisementImages', {
  advertisementId: { type: DataTypes.INTEGER, allowNull: false },
  imageUrl: { type: DataTypes.STRING, allowNull: false }
})

const Messages = sequelize.define('messages', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fromUserId: { type: DataTypes.INTEGER, allowNull: false },
  toUserId: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
})

module.exports = {
  User,
  Advertisement,
  Categories,
  Brands,
  AdvertisementImages,
  Messages,
};
