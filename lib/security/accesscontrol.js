const {
  ACCOUNT_LOCK_WINDOW,
  ACCOUNT_LOCK_THRESHOLD,
  ACCOUNT_LOCK_TIME,
  MAX_LOGIN_HISTORY,
} = require("../../config/application.config.js").security;
const moment = require("moment");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { MySQLClient, sql } = require("../database/client.js");
const PRIVILEGE = { NOMAL: "nomal" };
const LOGIN_STATUS = {
  SUCCESS: 0,
  FAILURE: 1,
};
const logger = require("../log/logger.js").application;
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
      var transaction, results, user;
      var now = new Date();
      transaction = await MySQLClient.beginTransaction();

      try {
        logger.info({
          action: "login_attempt",
          username: username,
          ip: req.ip,
        });

        // Get user info
        results = await transaction.executeQuery(
          await sql("SELECT_USER_BY_EMAIL_FOR_UPDATE"),
          [username]
        );

        if (results.length !== 1) {
          transaction.commit();
          return done(
            null,
            false,
            req.flash("message", "ユーザー名、またはパスワードが間違ってます。")
          );
        }
        user = {
          id: results[0].id,
          name: results[0].name,
          email: results[0].email,
          permissions: [PRIVILEGE.NOMAL],
        };
        // Check account lock status
        if (
          results[0].locked &&
          moment(now).isSameOrBefore(
            moment(results[0].locked).add(ACCOUNT_LOCK_TIME, "minutes")
          )
        ) {
          transaction.commit();
          return done(
            null,
            false,
            req.flash("message", "アカウントがロックされています。")
          );
        }

        // Delete old login log
        await transaction.executeQuery(await sql("DELETE_LOGIN_HISTORY"), [
          user.id,
          user.id,
          MAX_LOGIN_HISTORY - 1,
        ]);

        // パスワードの検証をtryブロック内に移動
        const isHashedPasswordValid = await bcrypt.compare(
          password,
          results[0].password
        );
        const isPlainPasswordValid = password === results[0].password;

        // パスワードの検証
        if (isHashedPasswordValid || isPlainPasswordValid) {
          try {
            // ログイン成功時のログを記録
            await transaction.executeQuery(await sql("INSERT_LOGIN_HISTORY"), [
              user.id,
              now,
              LOGIN_STATUS.SUCCESS,
            ]);

            // ロックを解除
            await transaction.executeQuery(await sql("UPDATE_USER_LOCKED"), [
              null,
              user.id,
            ]);

            logger.info({
              action: "login_success",
              userId: user.id,
              username: username,
              ip: req.ip,
            });

            // トランザクションをコミット
            await transaction.commit();

            // セッション再生成
            return new Promise((resolve, reject) => {
              req.session.regenerate((err) => {
                if (err) {
                  reject(err);
                } else {
                  done(null, user);
                  resolve();
                }
              });
            });
          } catch (err) {
            await transaction.rollback();
            return done(err);
          }
        }

        // パスワードが一致しない場合
        try {
          // ログイン失敗を記録
          await transaction.executeQuery(await sql("INSERT_LOGIN_HISTORY"), [
            user.id,
            now,
            LOGIN_STATUS.FAILURE,
          ]);

          const lockWindow = moment(now)
            .subtract(ACCOUNT_LOCK_WINDOW, "minutes")
            .toDate();

          // 同じトランザクション内でログイン失敗回数を確認
          const failureCount = await transaction.executeQuery(
            await sql("COUNT_LOGIN_HISTORY"),
            [user.id, lockWindow, LOGIN_STATUS.FAILURE]
          );

          if (failureCount[0].count >= ACCOUNT_LOCK_THRESHOLD) {
            await transaction.executeQuery(await sql("UPDATE_USER_LOCKED"), [
              now,
              user.id,
            ]);

            logger.warn({
              action: "account_locked",
              username: username,
              ip: req.ip,
              failureCount: failureCount[0].count,
            });

            await transaction.commit(); // トランザクションをコミット
            return done(
              null,
              false,
              req.flash("message", "アカウントがロックされました。")
            );
          }

          await transaction.commit(); // トランザクションをコミット

          logger.warn({
            action: "login_failure",
            username: username,
            ip: req.ip,
            reason: "invalid_password",
          });

          return done(
            null,
            false,
            req.flash("message", "ユーザー名、またはパスワードが間違ってます。")
          );
        } catch (err) {
          await transaction.rollback();
          logger.error({
            action: "login_history_error",
            username: username,
            ip: req.ip,
            error: err.message,
          });
          return done(err);
        }
      } catch (err) {
        logger.error({
          action: "login_error",
          username: username,
          ip: req.ip,
          error: err.message,
        });
        transaction.rollback();
        return done(err);
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
