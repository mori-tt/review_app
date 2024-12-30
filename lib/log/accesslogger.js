const log4js = require("log4js");
const logger = require("./logger.js").access;
const DEFAULT_LOG_LEVEL = "INFO";

module.exports = function (options) {
  options = options || {};
  options.level = options.level || DEFAULT_LOG_LEVEL;
  options.format = (req, res, format) => {
    return format(
      `:remote-addr - :method :url HTTP/:http-version :status ${res.responseTime}ms`
    );
  };
  return log4js.connectLogger(logger, options);
};
