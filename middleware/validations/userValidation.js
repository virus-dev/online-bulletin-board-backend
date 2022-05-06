const { email, password, firstName } = require('./validations');

const registrationRouterValidations = [
  email(),
  password(),
  firstName(),
]

module.exports = {
  registrationRouterValidations,
}