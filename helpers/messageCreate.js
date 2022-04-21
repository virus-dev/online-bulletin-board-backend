const { Messages } = require('../models/models');

const messageCreate = async ({ fromUserId, toUserId, message }) => Messages.create({
  fromUserId,
  toUserId,
  message,
  status: 'delivered',
});

module.exports = {
  messageCreate,
};