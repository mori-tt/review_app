var btnSubmit_onclick = function (event) {
  var submitButton = event.target;
  var form = submitButton.closest("form");
  var formData = new FormData(form);

  if (submitButton.getAttribute("data-method") === "GET") {
    // GETの場合、フォームの値をクエリパラメータとして追加
    var params = new URLSearchParams(formData);
    form.action =
      submitButton.getAttribute("data-action") + "?" + params.toString();
  } else {
    form.action = submitButton.getAttribute("data-action");
  }

  form.method = submitButton.getAttribute("data-method");

  // ボタンの二重押し防止
  submitButton.disabled = true;

  // フォームを直接送信
  form.submit();
};

var document_onready = function () {
  var submitButtons = document.querySelectorAll("button[type='submit']");
  submitButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault(); // デフォルトのsubmit動作を防止
      btnSubmit_onclick(e);
    });
  });
};

document.addEventListener("DOMContentLoaded", document_onready);
