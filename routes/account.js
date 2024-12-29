const router = require("express").Router();
const {
  authenticate,
  authorize,
  PRIVILEGE,
} = require("../lib/security/accesscontrol.js");

router.get("/login", (req, res) => {
  res.render("./account/login.ejs", { message: req.flash("message") });
});

router.post("/login", authenticate());

router.use("/reviews", require("./account.review.js"));

module.exports = router;
