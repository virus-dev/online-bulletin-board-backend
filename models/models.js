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

const Advertisement = sequelize.define('advertisement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  categoryId: { type: DataTypes.INTEGER },
  brandId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, values: ['open', 'closed', 'moderation'], defaultValue: 'moderation' },
  description: { type: DataTypes.STRING },
})

module.exports = {
  User,
  Advertisement,
};
