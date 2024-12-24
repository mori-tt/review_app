module.exports = {
  HOST: process.env.MYSQL_HOST,
  PORT: process.env.MYSQL_PORT || 3306,
  USERNAME: process.env.MYSQL_USERNAME,
  PASSWORD: process.env.MYSQL_PASSWORD,
  DATABASE: process.env.MYSQL_DATABASE,
  CONNECTION_LIMIT: process.env.MYSQL_CONNECTION_LIMIT
    ? process.env.MYSQL_CONNECTION_LIMIT
    : 10,
  QUEUE_LIMIT: process.env.MYSQL_QUEUE_LIMIT
    ? parseInt(process.env.MYSQL_QUEUE_LIMIT)
    : 0,
};
