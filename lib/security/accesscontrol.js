const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { MySQLClient, sql } = require("../database/client.js");
const PRIVILEGE = { NOMAL: "nomal" };
var initialize, authenticate, authorize;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  "local-strategy",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      var results, user;
      try {
        results = await MySQLClient.executeQuery(
          await sql("SELECT_USER_BY_EMAIL"),
          [username]
        );
      } catch (err) {
        return done(err);
      }
      if (results.length === 1 && password === results[0].password) {
        user = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
          permissions: [PRIVILEGE.NOMAL],
        };
        done(null, user);
      } else {
        done(
          null,
          false,
          req.flash("message", "ユーザー名、またはパスワードが間違ってます。")
        );
      }
    }
  )
);

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

authenticate = function () {
  return passport.authenticate("local-strategy", {
    successRedirect: "/account",
    failureRedirect: "/account/login",
  });
};

module.exports = {
  initialize,
  authenticate,
  authorize,
};