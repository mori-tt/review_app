const passport = require("passport");
var initialize, authenticate, authorize;

initialize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    },
  ];
};

module.exports = {
  initialize,
  authenticate,
  authorize,
};
