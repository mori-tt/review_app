(() => {
  // 画面表示前に履歴を制御（これが最も重要）
  window.history.pushState(null, null, null);
  window.history.forward();

  // ブラウザバックを無効化
  window.addEventListener("popstate", () => {
    window.history.pushState(null, null, null);
    window.location.replace(location.href);
  });
})();
