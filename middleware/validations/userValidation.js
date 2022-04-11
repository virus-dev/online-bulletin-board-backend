const { email, password } = require('./validations');

const loginRouterValidations = [
  email(),
  password(),
]

module.exports = {
  loginRouterValidations,
}