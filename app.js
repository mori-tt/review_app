const PORT = process.env.PORT;
const path = require("path");
const logger = require("./lib/log/logger.js");
const accesslogger = require("./lib/log/accesslogger.js");
const applicationlogger = require("./lib/log/applicationlogger.js");
const express = require("express");
const favicon = require("serve-favicon");
const app = express();

// Express setting
app.set("view engine", "ejs");
app.disable("x-powered-by");
// Expose global method to view engine
app.use((req, res, next) => {
  res.locals.moment = require("moment");
  res.locals.padding = require("./lib/math/math.js").padding;

  next();
});
// Static resource rooting
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));
// Set access log
app.use(accesslogger());
// Dynamic resource rooting
app.use("/shops", require("./routes/shops.js"));
app.use("/", require("./routes/index.js"));

// app.use("/test", async (req, res, next) => {
//   var data;
//   const { MySQLClient, sql } = require("./lib/database/client.js");
//   try {
//     data = await MySQLClient.executeQuery(
//       await sql("SELECT_SHOP_BASIC_BY_ID"),
//       [1]
//     );
//     console.log(data);
//   } catch (err) {
//     next(err);
//   }
//   res.end("END");
// });
// Set application log
app.use(applicationlogger());
// Execute web app
app.listen(PORT, () => {
  logger.application.info(`Application listening at :${PORT}`);
});
