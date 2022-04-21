class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }

  static badRequest(message) {
    return new ApiError(404, message);
  }

  static newBadRequest(res, message = 'Что-то пошло не так') {
    return res.status(500).json(message);
  }

  static serverError(message = '') {
    return new ApiError(500, 'что-то пошло не так' + message);
  }
}

module.exports = ApiError;