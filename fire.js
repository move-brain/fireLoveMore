var canvas = document.getElementById("cas");
var ocas = document.createElement("canvas");
var octx = ocas.getContext("2d");
var ctx = canvas.getContext("2d");
ocas.width = canvas.width = window.innerWidth;
ocas.height = canvas.height = window.innerHeight;
var bigbooms = [];

// 性能优化配置
var performanceConfig = {
  maxParticles: 347, // 限制最大粒子数（增加1/3：260→347）
  shadowBlurThreshold: 0.8, // 只有不透明度>0.8时才显示光晕（轻度优化：减少发光粒子）
  useSimplifiedPhysics: true, // 使用简化的物理计算
  particlePoolSize: 500, // 粒子对象池大小
};

// 粒子对象池
var particlePool = [];
for (var i = 0; i < performanceConfig.particlePoolSize; i++) {
  particlePool.push({
    inUse: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    color: null,
    opacity: 1,
    brightness: 1,
    dead: false,
  });
}

// window.onload = function() {
//     initAnimate();
// };

function initAnimate() {
  drawBg();
  lastTime = new Date();
  animate();
}
var lastTime;
var frameTime = 0;
var fps = 60;
var fpsInterval = 1000 / fps;
var actualFps = 60;
var fpsCounter = 0;
var fpsLastTime = Date.now();
var showFps = false; // 设置为true可以显示帧率

function animate() {
  var now = Date.now();
  var elapsed = now - frameTime;

  // 帧率统计
  fpsCounter++;
  if (now - fpsLastTime >= 1000) {
    actualFps = fpsCounter;
    fpsCounter = 0;
    fpsLastTime = now;
    // 自适应性能调整：如果帧率低于45fps，自动降低粒子数量
    if (actualFps < 45 && performanceConfig.maxParticles > 80) {
      performanceConfig.maxParticles = Math.max(
        80,
        performanceConfig.maxParticles - 10
      );
    }
  }

  // 帧率控制，确保稳定60fps
  if (elapsed > fpsInterval) {
    frameTime = now - (elapsed % fpsInterval);

    ctx.fillStyle = "rgba(0,5,24,0.18)"; // 轻度优化：加快尾迹消失
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 显示帧率（调试用）
    if (showFps) {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "14px monospace";
      ctx.fillText(
        "FPS: " + actualFps + " | Particles: " + performanceConfig.maxParticles,
        10,
        20
      );
    }

    var newTime = new Date();
    if (newTime - lastTime > 213 + (window.innerHeight - 767) / 3) {
      var random = Math.random() * 100 > 30 ? true : false;
      var x = getRandom(canvas.width * 0.08, canvas.width * 0.92);
      var y = getRandom(50, 200); // 扩大高度范围：一些烟花会在更低位置爆炸
      if (random) {
        var bigboom = new Boom(
          getRandom(canvas.width * 0.12, canvas.width * 0.88),
          2,
          "#FFF",
          {
            x: x,
            y: y,
          }
        );
        bigbooms.push(bigboom);
      } else {
        // 形状烟花也使用随机位置 ✨
        var bigboom = new Boom(
          getRandom(canvas.width / 3, (canvas.width * 2) / 3),
          2,
          "#FFF",
          {
            x: x, // 使用随机X坐标，不再固定在中央
            y: y, // 使用随机Y坐标，不再固定在200px
          },
          document.querySelectorAll(".shape")[
            parseInt(getRandom(0, document.querySelectorAll(".shape").length))
          ]
        );
        bigbooms.push(bigboom);
      }
      lastTime = newTime;
    }

    // 使用for循环代替foreach提升性能
    for (var i = 0; i < stars.length; i++) {
      if (stars[i]) stars[i].paint();
    }

    drawMoon();

    // 性能优化：批量清理已死亡的烟花
    var aliveBigbooms = [];
    for (var i = 0; i < bigbooms.length; i++) {
      var boom = bigbooms[i];
      if (!boom) continue;

      if (!boom.dead) {
        boom._move();
        boom._drawLight();
        aliveBigbooms.push(boom);
      } else {
        var hasAlive = false;
        for (var j = 0; j < boom.booms.length; j++) {
          var frag = boom.booms[j];
          if (frag && !frag.dead) {
            frag.moveTo(j);
            hasAlive = true;
          }
        }
        if (hasAlive) {
          aliveBigbooms.push(boom);
        }
      }
    }
    bigbooms = aliveBigbooms;
  }

  raf(animate);
}
function drawMoon() {
  var moon = document.getElementById("moon");
  var centerX = canvas.width - 200,
    centerY = 100,
    radius = 40; // 圆形月亮的半径

  if (moon.complete) {
    ctx.save();

    // ✨ 创建圆形裁剪区域
    ctx.beginPath();
    ctx.arc(centerX + radius, centerY + radius, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip(); // 裁剪成圆形

    // ✨ 防止图片变形：从图片中心裁剪正方形区域
    var imgWidth = moon.width;
    var imgHeight = moon.height;
    var size = Math.min(imgWidth, imgHeight); // 取较小边作为正方形边长
    var sx = (imgWidth - size) / 2; // 从中心开始裁剪
    var sy = (imgHeight - size) / 2;

    // 绘制图片：从图片中心裁剪正方形，填充到圆形区域
    ctx.drawImage(
      moon,
      sx,
      sy,
      size,
      size, // 源图片裁剪区域（正方形）
      centerX,
      centerY,
      radius * 2,
      radius * 2 // 目标绘制区域
    );

    ctx.restore();

    // ✨ 绘制偏黄色光晕效果
    var index = 0;
    for (var i = 0; i < 10; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        centerX + radius,
        centerY + radius,
        radius + index,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255,230,100,0.012)"; // 更偏黄色的光晕
      index += 3;
      ctx.fill();
      ctx.restore();
    }
  } else {
    moon.onload = function () {
      // 图片加载完成后会在下一帧自动绘制
    };
  }
}
Array.prototype.foreach = function (callback) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] !== null) {
      callback.apply(this[i], [i]);
    }
  }
};
var raf =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
canvas.onclick = function () {
  var x = event.clientX;
  var y = event.clientY;
  var bigboom = new Boom(
    getRandom(canvas.width / 3, (canvas.width * 2) / 3),
    2,
    "#FFF",
    {
      x: x,
      y: y,
    }
  );
  bigbooms.push(bigboom);
};
// 真实烟花颜色方案
var fireworkColors = [
  {
    name: "gold",
    colors: [
      { a: 255, b: 215, c: 0 },
      { a: 255, b: 223, c: 100 },
      { a: 255, b: 200, c: 50 },
    ],
  },
  {
    name: "red",
    colors: [
      { a: 255, b: 50, c: 50 },
      { a: 255, b: 100, c: 80 },
      { a: 200, b: 50, c: 50 },
    ],
  },
  {
    name: "blue",
    colors: [
      { a: 100, b: 150, c: 255 },
      { a: 150, b: 200, c: 255 },
      { a: 80, b: 120, c: 200 },
    ],
  },
  {
    name: "green",
    colors: [
      { a: 100, b: 255, c: 100 },
      { a: 150, b: 255, c: 150 },
      { a: 80, b: 200, c: 80 },
    ],
  },
  {
    name: "purple",
    colors: [
      { a: 200, b: 100, c: 255 },
      { a: 220, b: 150, c: 255 },
      { a: 180, b: 80, c: 200 },
    ],
  },
  {
    name: "cyan",
    colors: [
      { a: 100, b: 255, c: 255 },
      { a: 150, b: 255, c: 255 },
      { a: 80, b: 200, c: 200 },
    ],
  },
  {
    name: "orange",
    colors: [
      { a: 255, b: 165, c: 0 },
      { a: 255, b: 180, c: 50 },
      { a: 200, b: 140, c: 20 },
    ],
  },
  {
    name: "white",
    colors: [
      { a: 255, b: 255, c: 255 },
      { a: 240, b: 240, c: 255 },
      { a: 220, b: 220, c: 240 },
    ],
  },
  {
    name: "pink",
    colors: [
      { a: 255, b: 150, c: 200 },
      { a: 255, b: 180, c: 220 },
      { a: 200, b: 120, c: 180 },
    ],
  },
  //  彩虹混合主题 - 真正的多色混合效果
  {
    name: "rainbow",
    colors: [
      { a: 255, b: 0, c: 0 }, // 红
      { a: 255, b: 165, c: 0 }, // 橙
      { a: 255, b: 255, c: 0 }, // 黄
      { a: 0, b: 255, c: 0 }, // 绿
      { a: 0, b: 127, c: 255 }, // 蓝
      { a: 139, b: 0, c: 255 }, // 紫
    ],
  },
  //  日落混合主题 - 温暖的渐变色
  {
    name: "sunset",
    colors: [
      { a: 255, b: 69, c: 0 }, // 橙红
      { a: 255, b: 140, c: 0 }, // 深橙
      { a: 255, b: 215, c: 0 }, // 金色
      { a: 255, b: 105, c: 180 }, // 粉红
      { a: 255, b: 182, c: 193 }, // 浅粉
    ],
  },
  //  极光混合主题 - 神秘的冷色调
  {
    name: "aurora",
    colors: [
      { a: 0, b: 255, c: 127 }, // 青绿
      { a: 0, b: 191, c: 255 }, // 深蓝
      { a: 138, b: 43, c: 226 }, // 蓝紫
      { a: 255, b: 20, c: 147 }, // 粉紫
      { a: 0, b: 255, c: 255 }, // 青色
    ],
  },
  //  火焰混合主题 - 热烈的红橙色系
  {
    name: "flame",
    colors: [
      { a: 255, b: 0, c: 0 }, // 纯红
      { a: 255, b: 69, c: 0 }, // 橙红
      { a: 255, b: 140, c: 0 }, // 橙色
      { a: 255, b: 215, c: 0 }, // 金黄
      { a: 255, b: 255, c: 255 }, // 白心
    ],
  },
  //  樱花混合主题 - 浪漫的粉色系
  {
    name: "sakura",
    colors: [
      { a: 255, b: 192, c: 203 }, // 粉色
      { a: 255, b: 182, c: 193 }, // 浅粉
      { a: 255, b: 240, c: 245 }, // 淡粉
      { a: 219, b: 112, c: 147 }, // 深粉
      { a: 255, b: 255, c: 255 }, // 白色
    ],
  },
];

var Boom = function (x, r, c, boomArea, shape) {
  this.booms = [];
  this.x = x;
  this.y = canvas.height + r;
  this.r = r;
  this.c = c;
  this.shape = shape || false;
  this.boomArea = boomArea;
  this.theta = 0;
  this.dead = false;
  this.ba = parseInt(getRandom(80, 200));
  // 为每个烟花选择一个颜色主题
  this.colorTheme =
    fireworkColors[parseInt(getRandom(0, fireworkColors.length))];
};
Boom.prototype = {
  _paint: function () {
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  },
  _move: function () {
    var dx = this.boomArea.x - this.x,
      dy = this.boomArea.y - this.y;
    this.x = this.x + dx * 0.01;
    this.y = this.y + dy * 0.01;
    if (Math.abs(dx) <= this.ba && Math.abs(dy) <= this.ba) {
      if (this.shape) {
        this._shapBoom();
      } else {
        this._boom();
      }
      this.dead = true;
    } else {
      this._paint();
    }
  },
  _drawLight: function () {
    ctx.fillStyle = "rgba(255,228,150,0.25)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r + 2 * Math.random() + 1, 0, 2 * Math.PI);
    ctx.fill();
  },
  _boom: function () {
    // 性能优化：减少粒子数量
    var fragNum = Math.min(
      getRandom(40, performanceConfig.maxParticles),
      performanceConfig.maxParticles
    );
    //  100% 多色混合烟花（移除单色模式）
    var colors = this.colorTheme.colors;

    var fanwei = parseInt(getRandom(280, 450)); // 稍微减小爆炸范围以减少计算

    // 主粒子 - 每个粒子随机选择主题色
    for (var i = 0; i < fragNum; i++) {
      var color = colors[parseInt(getRandom(0, colors.length))]; // 随机选择颜色
      var a = getRandom(-Math.PI, Math.PI);
      var x = getRandom(0, fanwei) * Math.cos(a) + this.x;
      var y = getRandom(0, fanwei) * Math.sin(a) + this.y;
      var radius = getRandom(1, 2.5);
      var frag = new Frag(this.x, this.y, radius, color, x, y, 1);
      this.booms.push(frag);
    }

    // 添加细小的火星粒子，减少数量提升性能
    var sparkNum = parseInt(fragNum * 0.3); // 轻度优化：从0.4减少到0.3
    for (var i = 0; i < sparkNum; i++) {
      var sparkColor = colors[parseInt(getRandom(0, colors.length))];
      var a = getRandom(-Math.PI, Math.PI);
      var distance = getRandom(fanwei * 0.8, fanwei * 1.2);
      var x = distance * Math.cos(a) + this.x;
      var y = distance * Math.sin(a) + this.y;
      var radius = getRandom(0.5, 1.2);
      var frag = new Frag(this.x, this.y, radius, sparkColor, x, y, 0.7);
      this.booms.push(frag);
    }
  },
  _shapBoom: function () {
    var that = this;
    // ✨ 性能优化：根据内容类型选择采样间隔
    var isImage = this.shape.innerHTML.indexOf("img") >= 0;
    var isPhotoShape =
      isImage && this.shape.innerHTML.indexOf("photo-shape") >= 0;

    // 图片使用更大的采样间隔，减少粒子数量
    var samplingRate = isPhotoShape ? 12 : isImage ? 8 : 5;

    putValue(ocas, octx, this.shape, samplingRate, function (dots) {
      var dx = canvas.width / 2 - that.x;
      var dy = canvas.height / 2 - that.y;
      for (var i = 0; i < dots.length; i++) {
        color = {
          a: dots[i].a,
          b: dots[i].b,
          c: dots[i].c,
        };
        var x = dots[i].x;
        var y = dots[i].y;
        var radius = 1;
        var frag = new Frag(that.x, that.y, radius, color, x - dx, y - dy);
        that.booms.push(frag);
      }
    });
  },
};
function putValue(canvas, context, ele, dr, callback) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var img = new Image();
  if (ele.innerHTML.indexOf("img") >= 0) {
    img.src = ele.getElementsByTagName("img")[0].src;
    imgload(img, function () {
      // ✨ 性能优化：限制图片最大尺寸
      var maxSize = 150; // 图片烟花最大尺寸
      var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      var drawWidth = img.width * scale;
      var drawHeight = img.height * scale;

      context.drawImage(
        img,
        canvas.width / 2 - drawWidth / 2,
        canvas.height / 2 - drawHeight / 2,
        drawWidth,
        drawHeight
      );
      dots = getimgData(canvas, context, dr);
      callback(dots);
    });
  } else {
    var text = ele.innerHTML;
    context.save();
    var fontSize = 200;
    context.font = fontSize + "px 宋体 bold";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle =
      "rgba(" +
      parseInt(getRandom(128, 255)) +
      "," +
      parseInt(getRandom(128, 255)) +
      "," +
      parseInt(getRandom(128, 255)) +
      " , 1)";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    context.restore();
    dots = getimgData(canvas, context, dr);
    callback(dots);
  }
}
function imgload(img, callback) {
  if (img.complete) {
    callback.call(img);
  } else {
    img.onload = function () {
      callback.call(this);
    };
    // ✨ 添加错误处理，防止图片加载失败导致卡顿
    img.onerror = function () {
      console.error("图片加载失败:", img.src);
    };
  }
}
function getimgData(canvas, context, dr) {
  var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  context.clearRect(0, 0, canvas.width, canvas.height);
  var dots = [];
  for (var x = 0; x < imgData.width; x += dr) {
    for (var y = 0; y < imgData.height; y += dr) {
      var i = (y * imgData.width + x) * 4;
      if (imgData.data[i + 3] > 128) {
        var dot = {
          x: x,
          y: y,
          a: imgData.data[i],
          b: imgData.data[i + 1],
          c: imgData.data[i + 2],
        };
        dots.push(dot);
      }
    }
  }
  return dots;
}
function getRandom(a, b) {
  return Math.random() * (b - a) + a;
}
var maxRadius = 1,
  stars = [];
function drawBg() {
  for (var i = 0; i < 100; i++) {
    var r = Math.random() * maxRadius;
    var x = Math.random() * canvas.width;
    var y = Math.random() * 2 * canvas.height - canvas.height;
    var star = new Star(x, y, r);
    stars.push(star);
    star.paint();
  }
}
var Star = function (x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
};
Star.prototype = {
  paint: function () {
    ctx.fillStyle = "rgba(255,255,255," + this.r + ")";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  },
};
var focallength = 250;
var Frag = function (centerX, centerY, radius, color, tx, ty, brightness) {
  this.tx = tx;
  this.ty = ty;
  this.x = centerX;
  this.y = centerY;
  this.dead = false;
  this.centerX = centerX;
  this.centerY = centerY;
  this.radius = radius;
  this.color = color;
  this.brightness = brightness || 1; // 亮度参数
  this.opacity = 1; // 初始不透明度
  this.vx = (tx - centerX) * 0.02; // 初始速度x
  this.vy = (ty - centerY) * 0.02; // 初始速度y
  this.gravity = 0.05; // 重力
  this.friction = 0.98; // 空气阻力
};
Frag.prototype = {
  paint: function () {
    // 性能优化：减少shadowBlur的使用
    if (this.opacity > performanceConfig.shadowBlurThreshold) {
      ctx.save();
      ctx.shadowBlur = 10; // 从15减少到10
      ctx.shadowColor =
        "rgba(" +
        this.color.a +
        "," +
        this.color.b +
        "," +
        this.color.c +
        "," +
        this.opacity * 0.8 +
        ")";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle =
        "rgba(" +
        this.color.a +
        "," +
        this.color.b +
        "," +
        this.color.c +
        "," +
        this.opacity +
        ")";
      ctx.fill();
      ctx.restore();
    } else {
      // 不透明度低时不使用shadowBlur，直接绘制
      ctx.fillStyle =
        "rgba(" +
        this.color.a +
        "," +
        this.color.b +
        "," +
        this.color.c +
        "," +
        this.opacity +
        ")";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  },
  moveTo: function (index) {
    // 应用物理效果
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    // 渐变消失效果，稍微加快消失速度以提升性能
    this.opacity -= 0.025 * this.brightness; // 轻度优化：加快消失

    if (this.opacity <= 0) {
      this.dead = true;
    }
    this.paint();
  },
};
