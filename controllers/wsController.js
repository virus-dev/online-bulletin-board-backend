const { messageCreate } = require("../helpers/messageCreate");

const connectionHandler = (ws, id) => {
  ws.id = id;
}

const sendMessageHandler = ({ aWss, fromUserId, toUserId, newMessage }) => {
  aWss.clients.forEach((client) => {
    if (client.id === fromUserId) {
      // Отправитель
      const sendObj = {
        info: 'Ты отправил сообщение',
        method: 'youSendMessage',
        message: newMessage,
      }
      client.send(JSON.stringify(sendObj))
    }
    if (client.id === toUserId) {
      // Получатель
      const sendObj = {
        info: 'Ты получил сообщение',
        method: 'toYouSendMessage',
        message: newMessage,
      }
      client.send(JSON.stringify(sendObj))
    }
  })
}

const wsController = (aWss) => (ws, req) => {
  ws.on('message', async (msg) => {

    const {
      fromUserId,
      toUserId,
      userId,
      method,
      message,
    } = JSON.parse(msg);
    
    switch (method) {
      case 'connection':
        connectionHandler(ws, userId)
        break;
      case 'sendMessage':
        const newMessage = await messageCreate({ fromUserId, toUserId, message });
        sendMessageHandler({ aWss, fromUserId, toUserId, newMessage });
        break;
      default:
        break;
    }
  });
}

module.exports = wsController;
