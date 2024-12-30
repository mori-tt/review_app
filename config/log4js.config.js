const path = require("path");
const LOG_ROOT_DIR =
  process.env.LOG_ROOT_DIR || path.join(__dirname, "../logs");
const ENV = process.env.NODE_ENV || "development";
module.exports = {
  appenders: {
    ConsoleLogAppender: {
      type: "console",
    },
    ApplicationLogAppender: {
      type: "dateFile",
      filename: path.join(LOG_ROOT_DIR, "./application.log"),
      pattern: "yyyy-MM-dd",
      numBackups: 14,
      compress: true,
      maxLogSize: 5242880, // 5MB
    },
    AccessLogAppender: {
      type: "dateFile",
      filename: path.join(LOG_ROOT_DIR, "./access.log"),
      pattern: "yyyy-MM-dd",
      numBackups: 14,
      compress: true,
      maxLogSize: 5242880, // 5MB
    },
  },
  categories: {
    default: {
      appenders: ["ConsoleLogAppender"],
      level: ENV === "production" ? "INFO" : "ALL",
    },
    application: {
      appenders: [
        "ApplicationLogAppender",
        ...(ENV === "development" ? ["ConsoleLogAppender"] : []),
      ],
      level: ENV === "production" ? "ERROR" : "INFO",
    },
    access: {
      appenders: [
        "AccessLogAppender",
        ...(ENV === "development" ? ["ConsoleLogAppender"] : []),
      ],
      level: "INFO",
    },
  },
};
