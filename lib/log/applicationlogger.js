const logger = require("./logger.js").application;

module.exports = function (options) {
  return function (err, req, res, next) {
    const logLevel = err.status >= 500 ? "error" : "warn";
    next(err);
    logger[logLevel]({
      status: err.status || 500,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      user: req.user ? req.user.id : "anonymous",
    });

    next(err);
  };
};
