const bcrypt = require("bcrypt");

const PASSWORD = "password";

// ハッシュ文字列を生成するコード
(async function () {
  const salt = await bcrypt.genSalt(10, "b");
  const hash = await bcrypt.hash(PASSWORD, salt);
  console.log(hash);
})();
