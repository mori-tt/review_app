const router = require("express").Router();
const { MySQLClient, sql } = require("../lib/database/client.js");
const moment = require("moment");
const DATE_FORMAT = "YYYY/MM/DD";

var validateReviewData = function (req) {
  var body = req.body;
  var isValid = true,
    error = {};

  if (body.visit && !moment(body.visit, DATE_FORMAT).isValid()) {
    isValid = false;
    error.visit = "訪問日の日付文字列が不正です。";
  }

  if (isValid) {
    return undefined;
  }
  return error;
};

var createReviewData = function (req) {
  var body = req.body,
    date;

  return {
    shopId: body.shopId,
    score: parseFloat(body.score),
    visit:
      (date = moment(body.visit, DATE_FORMAT)) && date.isValid()
        ? date.toDate()
        : null,
    post: new Date(),
    description: body.description,
  };
};

router.get("/regist/:shopId(\\d+)", async (req, res, next) => {
  var shopId = req.params.shopId;
  var shop, shopName, review, results;

  try {
    results = await MySQLClient.executeQuery(
      await sql("SELECT_SHOP_BASIC_BY_ID"),
      [shopId]
    );
    shop = results[0] || {};
    shopName = shop.name || req.query.shopName;

    review = {
      visit: req.query.visit || "",
      score: req.query.score || "",
      description: req.query.description || "",
    };

    res.render("./account/reviews/regist-form.ejs", {
      shopId,
      shopName,
      review,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/regist/confirm", (req, res) => {
  var error = validateReviewData(req);
  var review = createReviewData(req);
  var { shopId, shopName } = req.body;

  if (error) {
    res.render("./account/reviews/regist-form.ejs", {
      error,
      shopId,
      shopName,
      review,
    });
    return;
  }

  res.render("./account/reviews/regist-confirm.ejs", {
    shopId,
    shopName,
    review,
  });
});

router.post("/regist/execute", async (req, res, next) => {
  var error = validateReviewData(req);
  var review = createReviewData(req);
  var { shopId, shopName } = req.body;
  var userId = "1"; // TODO: ログイン実装後に更新
  var transaction;

  if (error) {
    res.render("./account/reviews/regist-form.ejs", {
      error,
      shopId,
      shopName,
      review,
    });
    return;
  }

  try {
    transaction = await MySQLClient.beginTransaction();
    await transaction.executeQuery(await sql("SELECT_SHOP_BY_ID_FOR_UPDATE"), [
      shopId,
    ]);
    await transaction.executeQuery(await sql("INSERT_SHOP_REVIEW"), [
      shopId,
      userId,
      review.score,
      review.visit,
      review.description,
    ]);
    await transaction.executeQuery(await sql("UPDATE_SHOP_SCORE_BY_ID"), [
      shopId,
      shopId,
    ]);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    next(err);
    return;
  }

  res.render("./account/reviews/regist-complete.ejs");
});

module.exports = router;
