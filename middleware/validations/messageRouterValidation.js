const { message } = require('./validations');

const sendMessageRouterValidations = [
  message(),
]

module.exports = {
  sendMessageRouterValidations,
}