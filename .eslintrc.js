module.exports = {
  env: {
    browser: true,
    jquery: true,
    commonjs: true,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    indent: ["error", 2, { switchCase: 1 }],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": ["error", { vars: "all", args: "none" }],
    "no-console": ["off"],
  },
};
