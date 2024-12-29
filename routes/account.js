const router = require("express").Router();
const {
  authenticate,
  authorize,
  PRIVILEGE,
} = require("../lib/security/accesscontrol.js");

router.get("/", authorize(PRIVILEGE.NOMAL), (req, res) => {
  res.render("./account/index.ejs");
});

router.get("/login", (req, res, next) => {
  res.render("./account/login.ejs", { message: req.flash("message") });
});

router.post("/login", authenticate());

router.use(
  "/reviews",
  authorize(PRIVILEGE.NOMAL),
  require("./account.review.js")
);

module.exports = router;
