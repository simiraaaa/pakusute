/// <reference path="phina.js"/>



!function (phina, undefined) {
  
  // スケールと回転を考慮
  phina.input.Input.prototype._move = function(x, y) {
    //this._tempPosition.x = x;
    //this._tempPosition.y = y;

    // adjust scale
    var elm = this.domElement;
    var rect = elm.getBoundingClientRect();
    var transedRect = {
      left: { width: rect.height, height: rect.width },
      top: rect,
    };
    transedRect.right = transedRect.left;
    transedRect.bottom = rect;
    transedRect = transedRect[settings.rotate];
    x *= elm.width / transedRect.width;
    y *= elm.height / transedRect.height;
    var v = settings.getPoint(x, y, elm.width, elm.height);
    this._tempPosition.x = v.x;
    this._tempPosition.y = v.y;
  };

  /**
  ログから譜面を作る
  まず、始まったら、あらかじめ決めておいた表示可能領域までの譜面を表示する。
  譜面の描画順はあとから(一番手前が最前面)
  描画の更新はUPDATEで行う。

  */
  var VERSION = '0.0.12';

  var SCREEN_WIDTH = 480;
  var SCREEN_HEIGHT = 320;
  var ASSETS = {
    sound: {
      bgm: 'sound/bgm/bgm_maoudamashii_neorock33.mp3',
      se: 'sound/se/se_maoudamashii_instruments_drum1_cymbal.mp3',
      snare: 'sound/se/se_maoudamashii_instruments_drum1_snare.mp3',
    }
  };
  var window = phina.global;
  window.onerror = function(a,b,c,d,e) {
    alert(a);
    alert(b);
    alert(c);
    alert(d);
    alert(JSON.stringify(e));
  };
  // localize
  var display = phina.display;
  var Label = display.Label;
  var ui = phina.ui;
  var Button = ui.Button;
  var CanvasElement = display.CanvasElement;
  var context = phina.asset.Sound.audioContext;
  var assetManager = phina.asset.AssetManager;
  var assets = assetManager.assets;
  var images = assets.image;
  var sounds = assets.sound;
  var spritesheets = assets.spritesheet;

  //押した判定n秒以内
  var CHECKER = {
    just: 0.1,
    good: 0.13,
    bad: 0.16,
    miss: 0.19,
    none: 0.2,
  };
  var settings = {
    rotate: 'bottom', //どこがした
    getTransformRotate: function() {
      return this._rotateMap[this.rotate];
    },
    
    getPoint: function(x, y, w, h) { return { x: x, y: y }; },
    getPointMap: {
      left: function(x, y, w, h) {
        return { y: h - x, x: y };
      },
      right: function(x, y, w, h) {
        return { y: x, x: w - y };
      },
      bottom: function(x, y, w, h) {
        return { x: x, y: y };
      },
      top: function(x, y, w, h) {
        return { x: w - x, y: h - y };
      }
    },

    _rotateMap: {
      left: 'rotate(90deg)',
      right: 'rotate(270deg)',
      top: 'rotate(180deg)',
      bottom: 'rotate(0deg)',
    },
    refresh: function() {
      sounds.bgm.volume = this.volumes.bgm;
      sounds.se.volume = this.volumes.se;
      sounds.snare.volume = this.volumes.se;

      this.getPoint = this.getPointMap[this.rotate];
      app.domElement.style.transform = settings.getTransformRotate();
      app._fitFunc();
    },
    volumes: {
      se: 0.5,
      bgm: 0.5,
    },
  };



  var Date = window.Date;
  var app;
  //var pointing;
  var otoge = {
    music: null,

    timeStamp: -1,

    prevTime: 0,

    prevReturn:0,

    //AndroidでcurrentTimeが更新されないことがあるバグの対策
    get currentTime() {
      var timeStamp = context.currentTime;
      if (this.timeStamp < timeStamp) {
        this.prevTime = +new Date();
        return (this.prevReturn <timeStamp ? this.prevReturn= this.timeStamp = timeStamp:this.prevReturn);
      }
      if (timeStamp === 0) return 0;
      var delta = new Date() - this.prevTime;
      otoge.message.debug = delta;
      return this.prevReturn < (timeStamp=(timeStamp + delta / 1000))?this.prevReturn = timeStamp:this.prevReturn;

    },

    getRelativeTime: function () {
      return otoge.currentTime - otoge.delayTime;
    },
    message:null,
    JUST: 1,
    GOOD: 2,
    BAD: 3,
    MISS: 4,
    NONE: 0,
    delayTime: 0,

  };
  //var logger = phina.util.Log();
  //logger.create(['D', 'F', 'J', 'K']);

  var SCORE = { "_order": ["D", "F", "J", "K","L"],L:[], "D": [4.672000000000001, 5.311999999999999, 10.360000000000001, 10.701333333333334, 11.010666666666667, 22.730666666666664, 23.461333333333332, 24.032, 25.050666666666665, 25.72, 27.072, 31.312, 34.61066666666667, 38.552, 39.90133333333333, 44.752, 44.94133333333333, 45.141333333333336, 45.49066666666667, 45.68, 45.800000000000004, 47.62133333333333, 47.98133333333334, 48.352000000000004, 48.68, 49.120000000000005, 49.792, 51.832, 52.53066666666667, 52.93066666666667, 53.072, 53.45066666666667, 53.6, 53.992000000000004, 54.141333333333336, 54.512, 55.800000000000004, 56.41066666666667, 57.080000000000005, 57.69066666666667, 58.312000000000005, 58.992000000000004, 59.36, 59.89066666666667, 60.432, 61.080000000000005, 61.730666666666664, 62.38133333333333, 63.032, 63.66133333333333, 64.30133333333333, 70.12, 70.52, 71.09066666666666, 71.272, 74.04, 74.72, 75.37066666666666, 76.02133333333333, 76.34133333333334], "F": [1.04, 3.621333333333333, 4.68, 6.352, 6.701333333333334, 6.9013333333333335, 7.181333333333333, 7.3919999999999995, 7.9013333333333335, 8.170666666666667, 8.592, 11.701333333333334, 12.330666666666668, 12.992, 13.610666666666667, 16.18133333333333, 16.490666666666666, 17.090666666666664, 20.70133333333333, 21.151999999999997, 21.741333333333333, 22.050666666666665, 22.72, 23.421333333333333, 24.032, 24.68, 25.4, 26.06133333333333, 26.84, 29.479999999999997, 29.639999999999997, 29.810666666666666, 29.992, 30.381333333333334, 30.69066666666667, 31.010666666666662, 31.591999999999995, 31.981333333333335, 32.25066666666667, 32.53066666666667, 34.04, 35.501333333333335, 36.92, 38.2, 39.57066666666667, 42.792, 42.952000000000005, 43.120000000000005, 43.30133333333333, 43.45066666666667, 43.73066666666667, 43.992000000000004, 44.28, 44.57066666666667, 46.072, 46.221333333333334, 46.440000000000005, 46.632000000000005, 46.81066666666667, 47, 47.17066666666667, 47.56, 47.912, 48.26133333333333, 48.592, 48.800000000000004, 49.45066666666667, 50.17066666666667, 50.32, 50.552, 50.872, 51.032000000000004, 52.192, 54.330666666666666, 54.800000000000004, 56.832, 58.04, 60.760000000000005, 63.352000000000004, 64.74133333333333, 65.32000000000001, 65.912, 66.09066666666666, 66.4, 66.70133333333334, 67.02133333333333, 67.33066666666667, 67.66133333333333, 67.952, 68.28, 68.60000000000001, 68.93066666666667, 69.29066666666667, 69.56, 69.912, 71.552, 71.98133333333334, 72.32000000000001, 73, 73.62133333333334, 74.37066666666666, 75.032, 75.712, 76.19200000000001, 76.50133333333333], "J": [0.8906666666666667, 1.0613333333333332, 2.0613333333333332, 2.1919999999999997, 2.3813333333333335, 3.44, 3.7706666666666666, 4.690666666666667, 5.981333333333334, 6.1306666666666665, 11.381333333333334, 12.040000000000001, 12.68, 13.32, 14.000000000000002, 14.160000000000002, 14.690666666666667, 14.831999999999999, 15.341333333333333, 15.501333333333333, 16, 16.32, 16.631999999999998, 17.36, 18.08, 18.741333333333333, 19.38133333333333, 20.04, 20.712, 21.170666666666666, 21.752, 22.06133333333333, 22.712, 23.410666666666664, 24.050666666666665, 24.690666666666665, 25.38133333333333, 26.06133333333333, 26.671999999999997, 30.151999999999997, 30.84, 31.471999999999998, 32.112, 32.4, 32.821333333333335, 34.032000000000004, 35.330666666666666, 36.72, 38.04, 39.432, 40.74133333333334, 41.32, 42.032000000000004, 42.36, 42.712, 42.872, 43.04, 43.21066666666667, 43.36, 43.832, 44.38133333333334, 44.672000000000004, 44.84, 44.98133333333334, 45.141333333333336, 45.30133333333333, 45.472, 45.64, 45.792, 45.952000000000005, 46.120000000000005, 46.28, 46.58133333333333, 46.752, 47.080000000000005, 47.2, 47.480000000000004, 47.821333333333335, 48.21066666666667, 48.53066666666667, 48.781333333333336, 49.461333333333336, 50.13066666666667, 50.26133333333333, 50.81066666666667, 50.94133333333333, 51.501333333333335, 52.192, 54.32, 54.81066666666667, 56.832, 58.05066666666667, 60.77066666666667, 63.352000000000004, 64.68, 64.82133333333334, 65.26133333333334, 65.41066666666667, 65.84, 65.98133333333334, 66.50133333333333, 67.13066666666667, 67.77066666666667, 68.4, 69.08, 69.712, 71.47200000000001, 72.16, 74.06133333333334, 74.73066666666666, 75.38133333333333, 76.04, 76.37066666666666], "K": [4.68, 5.32, 6.4719999999999995, 7.0213333333333345, 7.730666666666666, 8.410666666666668, 9.112, 9.701333333333334, 10.360000000000001, 10.701333333333334, 11.021333333333335, 11.690666666666667, 12.32, 12.992, 13.621333333333334, 14.312, 14.991999999999999, 15.680000000000001, 16.831999999999997, 17.730666666666664, 18.36, 19.032, 19.70133333333333, 20.352, 22.4, 23.06133333333333, 23.730666666666664, 24.370666666666665, 25.050666666666665, 25.72, 26.410666666666664, 27.450666666666667, 28, 28.639999999999997, 29.272, 30.52, 31.16, 31.781333333333333, 33.461333333333336, 34.6, 35.970666666666666, 37.392, 37.69066666666667, 38.392, 39.74133333333334, 43.58133333333333, 44.101333333333336, 46.4, 46.90133333333333, 47.41066666666667, 47.752, 48.13066666666667, 48.472, 49.13066666666667, 49.800000000000004, 50.42133333333334, 51.141333333333336, 51.85066666666667, 52.541333333333334, 52.90133333333333, 53.05066666666667, 53.440000000000005, 53.61066666666667, 53.992000000000004, 54.141333333333336, 54.52, 55.800000000000004, 56.416000000000004, 57.101333333333336, 57.70133333333334, 58.32, 58.992000000000004, 59.36, 59.89066666666667, 60.440000000000005, 61.09066666666667, 61.72, 62.38133333333333, 63.032, 63.68000000000001, 64.30133333333333, 66.17066666666666, 66.8, 67.432, 68.08, 68.74133333333333, 69.392, 70.08, 70.53066666666668, 71.10133333333333, 71.30133333333333, 71.8, 72.45066666666666, 73, 73.632, 74.36, 75.04, 75.70133333333334, 76.232] };


  var SCENE_ARGUMENTS = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    query: '#world',
    assets: ASSETS,
    fit:false,
  };

  phina.main(function () {
    app = phina.display.CanvasApp(SCENE_ARGUMENTS);
    app.enableStats();
    //pointing = app.pointing;
    app.fps = 60;
    app.backgroundColor = '#55a';
    app.interactive.cursor.normal = app.interactive.cursor.hover = '';
    var _fitFunc = app._fitFunc=function() {
      var e = app.domElement;
      var s = e.style;
      var w, h;
      s.position = "absolute";
      s.margin = "auto";
      s.left = "0px";
      s.top = "0px";
      s.bottom = "0px";
      s.right = "0px";


      if ({ left: 1, right: 1 }[settings.rotate]) {
        var rateWidth = e.width / window.innerHeight;
        var rateHeight = e.height / window.innerWidth;
        var rate = e.height / e.width;

        if (rateWidth > rateHeight) {
          s.width = (w=Math.floor(innerHeight)) + "px";
          s.height = (h=Math.floor(innerHeight * rate)) + "px";
        }
        else {
          s.width =(w= Math.floor(innerWidth / rate) )+ "px";
          s.height = (h = Math.floor(innerWidth)) + "px";
        }
        if (w < h) {
          s.top = (Math.floor(w - h) / 2) + "px";
        } else {
          s.left = (Math.floor(h - w) / 2) + "px";
        }

      } else {
        var rateWidth = e.width / window.innerWidth;
        var rateHeight = e.height / window.innerHeight;
        var rate = e.height / e.width;

        if (rateWidth > rateHeight) {
          w=s.width = Math.floor(innerWidth) + "px";
          h=s.height = Math.floor(innerWidth * rate) + "px";
        }
        else {
          w=s.width = Math.floor(innerHeight / rate) + "px";
          h=s.height = Math.floor(innerHeight) + "px";
        }
      }
      console.log('width:', w, 'height:', h);
    } || function() { };

    var fitScreen = function(isEver) {
      isEver = isEver === undefined ? true : isEver;


      // 一度実行しておく
      _fitFunc();

      // リサイズ時のリスナとして登録しておく
      if (isEver) {
        window.addEventListener("resize", _fitFunc, false);
      }
    };
    fitScreen();
    var isSoundAvailable = false;
    var func;
    app.domElement.addEventListener('touchend', func = function (e) {
      if (isSoundAvailable) return false;
      isSoundAvailable = true;
      var sound = phina.asset.Sound();
      sound.loadFromBuffer();
      sound.volume = 0;
      sound.play().stop();
      app.domElement.removeEventListener('touchstart', func);
    });



    app.pushScene(phina.game.LoadingScene(SCENE_ARGUMENTS).on('exit', function() {
      KeyButton.SE = [sounds.se, sounds.snare, sounds.se, sounds.snare, sounds.se];
      app.replaceScene(SettingScene());
    }));
    app.run();
  });

  var GameScene = phina.define('', {
    superClass: phina.display.CanvasScene,

    init: function() {
      this.superInit(SCENE_ARGUMENTS);
      settings.refresh();
      var music = Music('bgm', SCORE);

      this.addChild(KeyButtonManager().setup());
      this.addChild(music);
      this.addChild(MessageLayer());
    },
  });

  var SettingScene = phina.define('', {
    superClass: phina.display.CanvasScene,

    init: function() {
      this.superInit(SCENE_ARGUMENTS);
      settings.refresh();
      Label(VERSION).setPosition(10, 20).addChildTo(this).align='left';
      var menu = MenuDialog(this._static.settingTree).addChildTo(this);
    },
    //onenter: function() {
    //  this.app.replaceScene(GameScene());
    //},

    _static: {

      // 末端処理に関数を入れるが、未実装は false
      settingTree: {
        index: [
          "ゲームスタート",
          '画面の回転',
          '音量設定'
        ],
        
        '画面の回転': {
          index: ["左", '右', "上", '下(回転なし)'],
          "左": function() {
            settings.rotate = 'left';
            settings.refresh();
          },
          '右': function() {
            settings.rotate = 'right';
            settings.refresh();
          },
          "上": function() {
            settings.rotate = 'top';
            settings.refresh();
          },
          '下(回転なし)': function() {
            settings.rotate = 'bottom';
            settings.refresh();
          },
        },
        "ゲームスタート": function() {
          app.replaceScene(GameScene());
        },

        "音量設定": {
          "BGM": false,
          "効果音": false,
          index: ["BGM","効果音"]
        },
      }
    },
  });

  // 縦並びボタン型メニュー
  var MenuDialog = phina.define('', {
    superClass: phina.display.CanvasElement,

    dialogGroup: null,
    currentMenu: null,

    init: function(menu) {
      this.superInit();
      this.menu = menu;
      var self = this;
      var currentMenu = this.currentMenu = menu;
      var group = this.dialogGroup = CanvasElement().addChildTo(this);
      var createMenu = this.createMenu = function(k, parentMenu, menu, i, group) {
        menu.parent = parentMenu;
        if (menu.index) {
          Button({
            text: k,
            fontSize: 24,
            width: SCREEN_WIDTH * 0.5,
            height: 30,
          }).addChildTo(group)
            .setPosition(SCREEN_WIDTH / 2, (i + 1) * 35)
            .on('pointend', function() {
              this.parent.remove();
              self.currentMenu = menu;
              var group = self.dialogGroup = CanvasElement().addChildTo(self);
              var j = 0;
              menu.index.forEach(function(k, i) {
                createMenu(k, menu, menu[k], j = i, group);
              });
              self.createBackButton(j + 1, group);

          });
        } else {
          var _k = k;
          if (!menu) {
            _k = k + "(未実装)";
            menu = function() { };
          }
          Button({
            text: _k,
            fontSize: 24,
            width: SCREEN_WIDTH * 0.5,
            height: 30,
          }).setPosition(SCREEN_WIDTH / 2, (i + 1) * 35)
            .addChildTo(group)
            .on('pointend', menu);

        }
      };
      menu.index.forEach(function(k, i) {
        createMenu(k, menu, menu[k], i, group);
      });

    },
    createMenu: function() { },

    createBackButton: function(i, group) {
      var self = this;
      return Button({
        text: '戻る',
        fontSize: 24,
        height: 30,
        fill:'green',
        width: SCREEN_WIDTH * 0.5,
      })
        .addChildTo(group).
        setPosition(SCREEN_WIDTH / 2, (i + 1) * 35)
      .on('pointend', function() {
        self.backDialog();
      });
      return this;
    },

    backDialog: function() {
      var self = this;
      this.dialogGroup.remove();
      var group = this.dialogGroup = CanvasElement().addChildTo(this);
      var current = this.currentMenu = this.currentMenu.parent;
      current.index.forEach(function(k, i) {
        self.createMenu(k, current, current[k], i, group);
      });
      return this;
    },
  });

  //var PopupScene = phina.define('', {
  //  superClass: phina.display.CanvasScene,

  //  init: function(w,h) {
  //    this.superInit({width:w,height:h}.$safe(SCENE_ARGUMENTS));
      
  //  },
  //});


  var MessageLayer = phina.define('', {
    superClass: CanvasElement,

    label: null,
    just: 0,
    good: 0,
    bad: 0,
    miss: 0,
    debug:0,


    init: function () {
      this.superInit();

      this.label = Label({
        text: '',
        align: 'left',
        fontSize: 24,
        fill: 'white',
        baseline:'top',
      })
      .setPosition(20, 60)
      .addChildTo(this);
      this.label.alpha = 0.3;

      otoge.message = this;
    },

    update: function (app) {
      this.label.text ='ver.'+VERSION+'\ndebug:'+this.debug+'\n'+
          'just:' + this.just
      + ',good:' + this.good
      + ',bad:' + this.bad
      + ',miss:' + this.miss
      + '\nchange speed:cursor up↑ or down↓\nchange rotate cursor ← →';
    }


  });


  //譜面描画とか判定とか全般クラス
  var Music = phina.define('', {
    superClass: CanvasElement,
    score: null,
    bgm: null,
    _elements: null,

    init: function (bgm, score) {
      this.superInit();
      this.setBgm(bgm);
      this.setScore(score);
      var elms = this._elements = [];
      var self = this;
      KeyButton.TYPES.forEach(function (t) {
        elms[KeyButton.TYPE_INDEX[t]] = elms[t] = ScoreWriter(t, score).addChildTo(self);
      });
      otoge.delayTime = otoge.currentTime;
      otoge.music = this;
    },

    //判定してスコアに反映したり
    play: function (t) {
      return this._elements[KeyButton.TYPE_INDEX[t]].play();
    },

    none: function () {
      otoge.message.none++;
      return otoge.NONE;
    },

    just: function () {
      otoge.message.just++;
      return otoge.JUST;
    },

    good: function () {
      otoge.message.good++;
      return otoge.GOOD;
    },

    bad: function () {
      otoge.message.bad++;
      return otoge.BAD;
    },

    miss: function () {
      otoge.message.miss++;
      return otoge.MISS;
    },


    setBgm: function (key) {
      this.bgm = sounds[key];//.clone();
      this.bgm.play();
      return this;
    },

    setScore: function (score) {
      this.score = score;
      return this;
    },

  });


  //譜面を描画する一列
  var ScoreWriter = phina.define('', {
    superClass: CanvasElement,
    type: null,
    score: null,
    JUST_Y: null,
    __image: null,

    //譜面の流れる速度倍率
    speed:1.2,


    init: function (type, score) {
      this.superInit();
      this.type = type;
      this.score = score[type].slice(0);
      this.x = KeyButton.getDefaultX(KeyButton.TYPE_INDEX[type]) - KeyButton.RADIUS;
      this.y = -KeyButton.RADIUS - KeyButton.STROKE_WIDTH;
      this.JUST_Y = KeyButton.DEFAULT_Y;
      var sel=this;
      window.addEventListener('keydown' , function (e) {
        var k = e.which;
        if (k === 38) {
          sel.speed += 0.05;
        } else if (k === 40) {
          sel.speed -= 0.05;
        } else if (k === 37) {
          settings.rotate = ({
            left: 'top',
            top: 'right',
            right: 'bottom',
            bottom: 'left',
          })[settings.rotate];
          settings.refresh();
        } else if (k === 39) {
          settings.rotate = ({
            left: 'bottom',
            top: 'left',
            right: 'top',
            bottom: 'right',
          })[settings.rotate];
          settings.refresh();
        }
      });
      this.__image = ScoreImage({ type: type }).canvas.domElement;
    },

    //描画する対象になる時間を入れていく
    //これをやる必要があるのか
    //check: function () {
    //    var score = this.score;
    //    var target = this.target;
    //    var rTime = otoge.getRelativeTime();
    //    var rate = 1 / (this.speed * 0.9);
    //    for (var i = 0, len = score.length; i < len; ++i) {
    //        if (rTime + rate < score[i]) break;
    //        target.push(score.shift());
    //    }
    //    return target.length;
    //},

    //判定して、描画やスコアに反映
    play: function () {
      if (!this.score.length) return otoge.NONE;
      //just = 0
      var y = otoge.getRelativeTime() - this.score[0];
      console.log(y);
      if (y < 0) {
        if (y < CHECKER.none - 1) return otoge.NONE;
        y = -y;
      }
            
      if (y < CHECKER.just) return this.effect(otoge.JUST);

      if (y <  CHECKER.good) return this.effect(otoge.GOOD);

      if (y <  CHECKER.bad) return this.effect(otoge.BAD);
      //miss
      return this.effect(otoge.MISS);
            

    },

    effect: function (timing) {
      var m = ['none', 'just', 'good', 'bad', 'miss'][timing];
      console.log(m);
      var target = otoge.getRelativeTime() - this.score.shift();
      console.log(target);
      return otoge.music[m]();
      //return this[m](1 - otoge.getRelativeTime() - this.target.shift());
    },


    //押されなかったとき
    miss: function (targets) {
      var time = otoge.getRelativeTime();
      targets.length.times(otoge.music.miss);
      //ミスしたエフェクトとか

    },


    //譜面を後ろから描画
    draw: function (canvas) {
      var c = canvas.context;
      if (!this.score.length) return;
      var SIZE = KeyButton.RADIUS * 2 + KeyButton.STROKE_WIDTH;
      var image = this.__image;
      var score = this.score;
      var JUST_Y = this.JUST_Y;
      var rTime = otoge.getRelativeTime();
      var speed = this.speed;
      var drawArea = -1 / (speed * 0.9);
      var MISS = CHECKER.miss;

      for (var i = score.length - 1; i >= 0; --i) {
        var y = rTime - score[i];
        //そもそも表示領域外
        if (y < drawArea) continue;

        if (y > MISS){
          //miss
          return this.miss(score.splice(0, 1 + i));
        }
        c.drawImage(image, 0, 0, SIZE, SIZE, 0, (1 + (y * speed)) * JUST_Y | 0, SIZE, SIZE);
      }
    },

  });


  var ScoreImage = phina.define('', {
    superClass: display.CircleShape,
    init: function(param) {
      param = param || {};
      var kp = KeyButton.KEY_PARAM[KeyButton.TYPE_INDEX[param.type]];
      param = {}.$safe(param, {
        fill: 'rgb(255,128,128)',//kp.fill.slice(0, -4) + '1)',
        stroke: kp.stroke,
        radius:KeyButton.RADIUS,
        strokeWidth: KeyButton.STROKE_WIDTH,
        padding:KeyButton.STROKE_WIDTH / 2,
        //shadow:true,
      });
      this.superInit(param);

      this._render();
    },

  });

  //押すところ
  var KeyButton = phina.define('', {
    superClass: display.CircleShape,
    type: null,
    keyCode: null,
    renderFlag:false,
    _index: 0,
    se: null,


    init: function (index) {
      this.superInit({
        radius:KeyButton.RADIUS,
        strokeWidth: KeyButton.STROKE_WIDTH,
      }.$extend(KeyButton.KEY_PARAM[index]));
      this.setPosition(KeyButton.getDefaultX(index), KeyButton.DEFAULT_Y);

      this.type = KeyButton.TYPES[index];
      this.keyCode = KeyButton.KEY_CODES[index];
      this._index = index;
      this.se = KeyButton.SE[index];

      this.addChild(Label({
        text: this.type,
        fontSize: this.width,
        fill: 'gray',
        stroke:false,
      }));
      this.interactive = true;
    },
    onpointstart: function() { console.log('OK:'+this.type);},

    //どっちかって言うとpressだと思う
    push: function () {
      this.se/*.clone()*/.play();
      this.renderFlag = true;
      //this.log();
      this.play();
    },

    play: function () {
      return otoge.music.play(this.type);
    },

    update: function () {
      this.renderFlag && this.pushWave();
    },

    check: function () {

    },

    log: function () {
      var o = {};
      o[this.type] = otoge.currentTime - otoge.delayTime;
      logger.push(o);
    },

    pushWave: function () {
      var wave = Wave(this.canvas);
      wave.$extend({
        x: this.x,
        y: this.y,
      });
      this.parent.addChild(wave);
      this.renderFlag = false;
    },

    _static: {
      RADIUS: 24,
      STROKE_WIDTH: 3,

      TYPES: ['D', 'F', 'J', 'K','L'],
      KEY_CODES: [68, 70, 74, 75, 76],
      TYPE_INDEX: {
        d: 0,
        f: 1,
        j: 2,
        k: 3,
        l: 4,
        D: 0,
        F: 1,
        J: 2,
        K: 3,
        L: 4,
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
      },
      KEY_PARAM: [
          {
            fill: 'navy',//'rgba(200,85,85,0.5)',
            stroke: 'white',
          },
          {
            fill: 'navy',// 'rgba(85,85,200,0.5)',
            stroke: 'white',
          },
          {
            fill: 'navy',// 'rgba(85,200,85,0.5)',
            stroke: 'white',
          },
          {
            fill: 'navy',// 'rgba(190,190,50,0.5)',
            stroke: 'white',
          },
          {
            fill: 'navy',// 'rgba(190,190,50,0.5)',
            stroke: 'white',
          },
      ],
      getDefaultX: function(index) { return (1 + index) * SCREEN_WIDTH / 5.5 - SCREEN_WIDTH / 22; },
      DEFAULT_Y: SCREEN_HEIGHT * 0.84,

    }

  });



  //ほわんってやつ
  var Wave = phina.define('', {
    superClass: display.Sprite,

    init: function (canvas) {
      this.superInit(canvas);
      var self = this;
      this.tweener.to({
        alpha: 0.1,
        scaleY: 2,
        scaleX: 2,
      }, 250).call(function () { self.remove(); });
    },

    //update: function (app) {
    //    if (this.alpha < 0.1) { this.remove(); }
    //    this.setScale(this.scaleX + 0.1);
    //    this.alpha *= 0.82;
    //}
  });

  var KeyButtonManager = phina.define('', {
    superClass: CanvasElement,

    keyButtonList: null,

    __keydown: null,
    __keyup: null,
    __mousedown: null,
    __touchstart: null,
    __touchend: null,





    init: function () {
      this.superInit();
      var self = this;
      self.keyButtonList = [];
      (5).times(function (i) {
        self.keyButtonList.push(self.addChild(KeyButton(i)));
      });

    },


    setup: function () {
      this.setOnkeydown();
      this.setOnmousedown();
      this.setOntouchstart();
      return this;
    },

    close: function () {
      !{
        mousedown: this.__mousedown,
        keydown: this.__keydown,
        keyup: this.__keyup,
        touchstart: this.__touchstart,
        touchend: this.__touchend,
      }.$forIn(function (k, v) {
        window.removeEventListener(k, v);
      });
    },

    setOntouchstart: function () {
      var keyList = this.keyButtonList;

      this.__touchstart = function (e) {
        var touches = e.changedTouches;
        for (var i = 0, len = touches.length; i < len; ++i) {
          var _touch = touches[i];
          var touch = KeyButtonManager.getPoint(_touch);

          keyList.some(function (e) {
            if (e._touchID!=null) return false;
            if (e.hitTestRect(touch.x, touch.y)) {
              e.push();
              e._touchID = _touch.identifier;
              return true;
            }
          });
        }
      };
      this.__touchend = function (e) {
        var touches = e.changedTouches;
        for (var i = 0, len = touches.length; i < len; ++i) {
          var _touchID = touches[i].identifier;

          keyList.some(function (e) {
            if (null == e._touchID) return false;
            if (e._touchID === _touchID) {
              e._touchID = null;
              return true;
            }
          });
        }
      };
      app.domElement.addEventListener('touchstart', this.__touchstart);
      app.domElement.addEventListener('touchend', this.__touchend);
    },


    setOnkeydown: function () {
      var codeList = [];
      var isDown = [0, 0, 0, 0, 0];
      var keyList = this.keyButtonList;


      keyList.forEach(function (e) {
        codeList.push(e.keyCode);
      });
      this.__keydown = function (e) {
        var index = codeList.indexOf(e.which);
        if (index === -1 || isDown[index]) return false;
        isDown[index] = true;
        var kb = keyList[index];
        kb.push();
      };

      this.__keyup = function (e) {
        var index = codeList.indexOf(e.which);
        if (index === -1 || !isDown[index]) return false;
        isDown[index] = false;
      };
      window.addEventListener('keydown', this.__keydown, false);
      window.addEventListener('keyup', this.__keyup, false);
    },


    setOnmousedown: function () {

      var keyList = this.keyButtonList;

      this.__mousedown = function (e) {
        var mouse = KeyButtonManager.getPoint(e);

        keyList.forEach(function (e) {
          e.hitTestRect(mouse.x, mouse.y) && e.push();
        });
      };
      app.domElement.addEventListener('mousedown', this.__mousedown);
    },

  });

  KeyButtonManager.getPoint = function(e) {

    var elm = app.domElement;
    //var style = elm.style;
    var rect = elm.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var transedRect = {
      left: {width:rect.height,height:rect.width},
      top: rect,
    };
    transedRect.right = transedRect.left;
    transedRect.bottom = rect;
    transedRect = transedRect[settings.rotate];
    x *= elm.width / transedRect.width;
    y *= elm.height / transedRect.height;
    return settings.getPoint(x, y, elm.width,elm.height);
  };


}(phina);