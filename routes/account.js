const router = require("express").Router();

router.get("/login", (req, res) => {
  res.render("./account/login.ejs");
});

router.get("/", (req, res, next) => {
  res.render("./account/login.ejs");
});

router.use("/reviews", require("./account.review.js"));

module.exports = router;
