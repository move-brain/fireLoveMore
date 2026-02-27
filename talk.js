$(function () {
  $("#yes").click(function (event) {
    modalLove("我就知道向秦小姐姐您一定会喜欢我的。(^_^)", function () {
      $(".page_one").addClass("hide");
      $(".page_two").removeClass("hide");
      // typeWrite();
      fireworks();
    });
  });
  $("#no").click(function (event) {
    modalDual("哎呀，你最好了嘛", A);
  });
});

function A() {
  modalDual("向秦最可爱美丽啦！！！", B);
}

function B() {
  modalDual("我知道你一定是喜欢我的。", C);
}

function C() {
  modalDual("爱你。么么哒！", D);
}

function D() {
  modalDual("向秦！你居然点到这里！🥺", E);
}

function E() {
  modalDual("我知道的你是反骨，你一定是口是心非", F);
}

function F() {
  modalLove("你心里肯定是愿意的，我懂～～", function () {
    fireworks();
  });
}

function fireworks() {
  $(".page_one").addClass("hide");
  initAnimate();
}

// 单按钮弹窗（原有的）
function modal(content, callback) {
  var tpl =
    '<div class="container">' +
    '<div class="mask"></div>' +
    '<div class="modal">' +
    "<p>" +
    content +
    "</p>" +
    '<button type="button" id="confirm" class="confirm">确定</button>' +
    "</div>" +
    "</div>";
  $("body").append(tpl);
  $(document).on("click", ".confirm", function () {
    $(".container").remove();
    callback();
  });
}

// "爱你爱你"按钮的弹窗 ✨
function modalLove(content, callback) {
  var tpl =
    '<div class="container">' +
    '<div class="mask"></div>' +
    '<div class="modal">' +
    "<p>" +
    content +
    "</p>" +
    '<button type="button" id="confirm" class="confirm">爱你爱你</button>' +
    "</div>" +
    "</div>";
  $("body").append(tpl);
  $(document).on("click", ".confirm", function () {
    $(".container").remove();
    callback();
  });
}

// 双按钮弹窗 ✨
function modalDual(content, nextCallback) {
  var tpl =
    '<div class="container">' +
    '<div class="mask"></div>' +
    '<div class="modal">' +
    "<p>" +
    content +
    "</p>" +
    '<div style="display: flex; justify-content: center; gap: 10px;">' +
    '<button type="button" class="btn-reject confirm">勉强考虑</button>' +
    '<button type="button" class="btn-accept confirm">爱你爱你</button>' +
    "</div>" +
    "</div>" +
    "</div>";
  $("body").append(tpl);

  // 点击"勉强考虑" - 进入下一个弹窗
  $(document).on("click", ".btn-reject", function () {
    $(".container").remove();
    $(document).off("click", ".btn-reject");
    $(document).off("click", ".btn-accept");
    nextCallback();
  });

  // 点击"爱你爱你" - 显示"嘿嘿，我也是"
  $(document).on("click", ".btn-accept", function () {
    $(".container").remove();
    $(document).off("click", ".btn-reject");
    $(document).off("click", ".btn-accept");
    modalNoButton("嘿嘿，我也是");
  });
}

// 无按钮弹窗 ✨ (2秒后消失 + 点击也消失)
function modalNoButton(content) {
  var tpl =
    '<div class="container no-button-modal">' +
    '<div class="mask"></div>' +
    '<div class="modal">' +
    '<p style="font-size: 24px; padding: 40px;">' +
    content +
    "</p>" +
    "</div>" +
    "</div>";
  $("body").append(tpl);

  // 2秒后自动关闭并开始放烟花 ✨
  var timer = setTimeout(function () {
    $(".no-button-modal").remove();
    fireworks();
  }, 2000);

  // 点击任意位置也能关闭并放烟花 ✨
  $(document).on("click", ".no-button-modal", function () {
    clearTimeout(timer);
    $(".no-button-modal").remove();
    $(document).off("click", ".no-button-modal");
    fireworks();
  });
}
