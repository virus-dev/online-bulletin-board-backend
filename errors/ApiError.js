class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }

  static normalBadRequest(res, message = '') {
    return res.status(400).json(message);
  }

  static badRequest(message) {
    return new ApiError(404, message);
  }

  static newBadRequest(res, message = 'Что-то пошло не так') {
    return res.status(500).json(message);
  }

  static notFound(res, message = 'Не найдено') {
    return res.status(404).json(message);
  }

  static conflict(res, message = 'Запись уже есть') {
    return res.status(409).json(message);
  }

  static serverError(message = '') {
    return new ApiError(500, 'что-то пошло не так' + message);
  }

  static newServerError(res, message = '') {
    return res.status(500).json('Что-то пошло не так' + message)
  }
}

module.exports = ApiError;