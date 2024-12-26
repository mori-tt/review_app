const router = require("express").Router();

router.use("/reviews", require("./account.review.js"));

module.exports = router;
