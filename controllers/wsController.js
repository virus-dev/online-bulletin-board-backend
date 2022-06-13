const jwt = require('jsonwebtoken');
const ApiError = require("../errors/ApiError");
const { messageCreate } = require("../helpers/messageCreate");
const { Messages, User } = require("../models/models");

const connectionHandler = (ws, id) => {
  ws.id = id;
}

const sendMessageHandler = ({ aWss, fromUserId, toUserId, newMessage }) => {
  aWss.clients.forEach(async (client) => {
    if (client.id === fromUserId) {
      const user = await User.findOne({ where: { id: toUserId }, attributes: ['email', 'id', 'firstName', 'secondName', 'image', 'phone', 'role'] });
      Messages.findAll({ where: { toUserId: fromUserId, fromUserId: toUserId, status: 'delivered' } })
        .then((messages) => {
          messages.forEach((message) => {
            message.update({ status: 'read' })
          })
        });
      // Отправитель
      const sendObj = {
        info: 'Ты отправил сообщение',
        method: 'youSendMessage',
        message: newMessage,
        user: user,
        unreadMessagesCount: 0,
      }
      client.send(JSON.stringify(sendObj))
    }
    if (client.id === toUserId) {
      const user = await User.findOne({ where: { id: fromUserId }, attributes: ['email', 'id', 'firstName', 'secondName', 'image', 'phone', 'role'] })
      const unreadMessagesCount = await Messages.count({ where: { fromUserId, toUserId, status: 'delivered' } })
      // Получатель
      const sendObj = {
        info: 'Ты получил сообщение',
        method: 'toYouSendMessage',
        message: newMessage,
        user: user,
        unreadMessagesCount,
      }
      client.send(JSON.stringify(sendObj))
    }
  })
}

const readMessageHandler = ({ aWss, fromUserId, toUserId, id }) => {
  aWss.clients.forEach((client) => {
    if ([fromUserId, toUserId].includes(client.id)) {
      if (client.id === fromUserId) {
        // Получатель
        const sendObj = {
          info: 'Сообщение прочитано',
          method: 'yourMessageWasRead',
          fromUserId,
          toUserId,
          id,
        }
        client.send(JSON.stringify(sendObj))
      }
      if (client.id === toUserId) {
        // Отправитель
        const sendObj = {
          info: 'Сообщение прочитано',
          method: 'youReadedMessage',
          fromUserId,
          toUserId,
          id,
        }
        client.send(JSON.stringify(sendObj))
      }
    }
  })
}

const wsController = (aWss) => (ws, req) => {
  ws.on('message', async (msg) => {    
    try {
      const {
        fromUserId,
        toUserId,
        userId,
        method,
        message,
        token,
        id,
      } = JSON.parse(msg);

      const validToken = token.split(' ')[1];
      jwt.verify(validToken, process.env.SECRET_KEY)

      switch (method) {
        case 'connection':
          connectionHandler(ws, userId)
          break;
        case 'sendMessage':
          const newMessage = await messageCreate({ fromUserId, toUserId, message });
          sendMessageHandler({ aWss, fromUserId, toUserId, newMessage });
          break;
        case 'readMessage':
          const currentMessage = await Messages.findOne({ where: { id, fromUserId, toUserId } });
          await currentMessage.update({ status: 'read' });
          readMessageHandler({ aWss, fromUserId, toUserId, id });
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e)
    }
  });
}

module.exports = wsController;
