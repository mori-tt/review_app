const bcrypt = require("bcrypt");
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

      if (results.length === 1) {
        // ハッシュ化されたパスワードとの比較
        const isHashedPasswordValid = await bcrypt.compare(
          password,
          results[0].password
        );

        // 平文パスワードとの比較
        const isPlainPasswordValid = password === results[0].password;

        if (isHashedPasswordValid || isPlainPasswordValid) {
          user = {
            id: results[0].id,
            name: results[0].name,
            email: results[0].email,
            permissions: [PRIVILEGE.NOMAL],
          };
          req.session.regenerate((err) => {
            if (err) {
              done(err);
            } else {
              done(null, user);
            }
          });
          return;
        }
      }

      done(
        null,
        false,
        req.flash("message", "ユーザー名、またはパスワードが間違ってます。")
      );
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

authorize = function (privilege) {
  return function (req, res, next) {
    if (
      req.isAuthenticated() &&
      (req.user.permissions || []).indexOf(privilege) >= 0
    ) {
      next();
    } else {
      res.redirect("/account/login");
    }
  };
};

module.exports = {
  initialize,
  authenticate,
  authorize,
  PRIVILEGE,
};
