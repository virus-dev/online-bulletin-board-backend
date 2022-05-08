const { Op } = require('sequelize');
const ApiError = require('../errors/ApiError');
const { Messages, User } = require('../models/models');

class messageController {
  async sendMessage(req, res, next) {
    try {
      const { message, toUserId } = req.body;

      if (!message || !toUserId) {
        return ApiError.badRequest('Не хватает данных');
      }

      const {
        email,
      } = req.user;

      if (!email) {
        return ApiError.badRequest('Нет пользователя');
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return ApiError.badRequest('Нет пользователя');
      }

      if (user.id === toUserId) {
        return ApiError.newBadRequest(res, 'Нельзя отправлять сообщения самому себе');
      }

      const newMessage = await Messages.create({
        fromUserId: user.id,
        toUserId,
        message,
        status: 'delivered',
      });

      return res.json(newMessage);
    } catch (e) {
      return res.status(500).json(e);
    }
  }

  async readMessage(req, res, next) {
    try {
      const { id, fromUserId, toUserId, message } = req.body;

      if (!fromUserId || !toUserId || !message || !id) {
        ApiError.newBadRequest(res, 'Недостаточно данных');
      }

      const currentMessage = await Messages.findOne({ where: { fromUserId, toUserId, message, id } });

      if (!currentMessage) {
        ApiError.newBadRequest(res, 'Сообщение не найдено');
      }

      if (currentMessage.status === 'read') {
        ApiError.newBadRequest(res, 'Это сообщение уже прочитано');
      }
      
      await currentMessage.update({ status: 'read' });

      return res.json(currentMessage)
    } catch (e) {
      return res.status(500).json(e);
    }
  }

  async getCountUnreadMessages(req, res, next) {
    try {
      const {
        email,
      } = req.user;

      if (!email) {
        return ApiError.newBadRequest(res, 'Нет пользователя');
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return ApiError.newBadRequest(res, 'Нет пользователя');
      }

      const { count } = await Messages.findAndCountAll({ where: { toUserId: user.id, status: 'delivered' } });

      return res.json(count);
    } catch (e) {
      return ApiError.newBadRequest(res);
    }
  }

  async getDialogs(req, res, next) {
    try {
      const {
        email,
      } = req.user;

      if (!email) {
        return ApiError.newBadRequest(res, 'Нет пользователя');
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return ApiError.newBadRequest(res, 'Нет пользователя');
      }

      const messages = await Messages.findAll({
        where: {
          [Op.or]: [
            { fromUserId: user.id },
            { toUserId: user.id },
          ]
        },
        order: [[ 'createdAt', 'DESC' ]],
      });

      let onceId = [];

      const dialogs = messages.reduce((prevValue, currentValue) => {
        // Первая итерация
        if (!prevValue.length) {
          if (currentValue.id === 58) { console.log('1') }
          onceId = [currentValue.toUserId, currentValue.fromUserId];
          
          currentValue.status === 'delivered' && currentValue.fromUserId !== user.id && currentValue.toUserId === user.id && currentValue.setDataValue('unreadMessagesCount', 1);

          return [currentValue];
        }

        // Новый диалог
        if (
          !onceId.includes(currentValue.fromUserId) || !onceId.includes(currentValue.toUserId)
        ) {
            if (currentValue.id === 58) { console.log('2') }
          onceId = [...onceId, currentValue.fromUserId, currentValue.toUserId]
          currentValue.status === 'delivered' && currentValue.fromUserId !== user.id && currentValue.toUserId === user.id && currentValue.setDataValue('unreadMessagesCount', 1);
          return [...prevValue, currentValue];
        }

        const currectDialog = prevValue.find((el) => 
          el.fromUserId === currentValue.fromUserId && el.toUserId === currentValue.toUserId
          || el.fromUserId === currentValue.toUserId && el.toUserId === currentValue.fromUserId
        );

        if (currentValue.status === 'delivered' && currentValue.fromUserId !== user.id && currentValue.toUserId === user.id) {
          const unreadMessagesCount = currectDialog.getDataValue('unreadMessagesCount');
          currectDialog.setDataValue('unreadMessagesCount', (unreadMessagesCount || 0) + 1);
        }

        return prevValue;
      }, [])

      return res.json(dialogs);
    } catch (e) {
      console.log(e)
      return ApiError.newBadRequest(res, e);
    }
  }

  async getChat(req, res, next) {
    try {
      const { idInterlocutor } = req.query;

      if (!idInterlocutor) {
        return ApiError.newBadRequest(res, 'Не хватает данных');
      }

      const {
        email,
      } = req.user;

      if (!email) {
        return ApiError.newBadRequest(res, 'Нет пользователя');
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return ApiError.newBadRequest(res, 'Нет пользователя');
      }

      const messages = await Messages.findAll({
        where: {
          fromUserId: { [Op.or]: [user.id, idInterlocutor] },
          toUserId: { [Op.or]: [user.id, idInterlocutor] },
        },
        order: [[ 'createdAt' ]],
      });

      return res.json(messages);
    } catch (e) {
      return ApiError.newBadRequest(res, e);
    }
  }
}

module.exports = new messageController();
