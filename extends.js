/// <reference path="phina.js"/>

(function(phina, undefined) {

  /**
   * @class phina.util.Log
   * ログの記録。読み込み、出力を行う
   */
  phina.define("phina.util.Log", {
    superClass: phina.util.EventDispatcher,
    log: null,
    isMin: false,
    min: null,
    maxLength: Infinity,
    length: 0,

    init: function(path) {
      this.superInit();
      path ? this.load(path) : this.log = { _order: [] };
    },

    /**
     * ログをどれだけ取るか。
     */
    setMaxLength: function(len) {
      this.maxLength = len;
      return this;
    },

    /**
     * ログを取るプロパティを作る
     * @param names [name, name,,,]
     */
    create: function(names) {
      var log = this.log;
      names.forEach(function(e) {
        if (log[e]) log._order.erase(e);
        log[e] = [];
        log._order.push(e);
      });
      return this;
    },

    /**
     * ログを取るプロパティを作る。
     * 既に存在する場合は無視する
     * @param names [name, name,,,]
     */
    safeCreate: function(names) {
      var log = this.log;
      names.forEach(function(e) {
        if (log[e]) return;
        log[e] = [];
        log._order.push(e);
      });
      return this;
    },


    /**
     * ログを記録する。
     * 存在しないプロパティに対してpushした場合はError
     * @param prop 
     * {
     *  name:value,
     *  name:value,,,,
     * }
     */
    push: function(prop) {
      if (this.length > this.maxLength) return this;
      this.length++;
      for (var k in prop) {
        this.log[k].push(prop[k]);
      }
      return this;
    },

    /**
     * ログを記録する。
     * 存在しないプロパティに対してpushする場合は新たにプロパティを作る
     * @param prop 
     * {
     *  name:value,
     *  name:value,,,,
     * }
     */
    safePush: function(prop) {
      if (this.length > this.maxLength) return this;
      this.length++;
      var log = this.log;
      for (var k in prop) {
        if (!log[k]) {
          log[k] = [];
          log._order.push(k);
        }
        log[k].push(prop[k]);
      }
      return this;
    },

    /**
     * ログを圧縮する。
     */
    minify: function() {
      //todo 圧縮
      this.min; //圧縮
      this.isMin = true;
      return this;
    },

    /**
     * ログを解凍する。
     */
    parse: function() {
      //解凍
      return this;
    },


    /**
     * ログを出力する。
     * @param title ファイル名 title.json となる
     */
    download: function(title) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(this.createBlob());
      a.download = title + ".json";
      a.click();
      return this;
    },


    /**
     * ログを読み込むする。
     * @param title
     *  phina.asset.AssetManager.get(title)
     */
    load: function(title) {
      this.log = phina.asset.AssetManager.get(title).data;
      return this;
    },


    /**
     * ログを読み込むする。
     * @param path
     *  
     */
    loadByPath: function(path) {
      //phina.asset.Loader?
    },


    /**
     * jsonファイルを作る
     */
    createBlob: function() {
      var json = this.isMin ? this.min : this.log;
      return new Blob([JSON.stringify(json)], { type: 'application/json' });
    },

    /**
     * 要素からログを取る
     * enterframeで自動的に取る
     * @param elm Sceneに追加されているawakeなElement
     * @param names [properties]
     */
    fromElement: function(elm, names) {
      this.create(names);
      var self = this;
      elm.on('enterframe', function(e) {
        var obj = {};
        names.forEach(function(e) {
          obj[e] = elm[e];
        });
        self.push(obj);
      });
      return this;
    },

    /**
     * ログからElementにプロパティを代入していく
     * updateを上書きする
     * @param elm Sceneに追加されているawakeなElement
     */
    play: function(elm) {
      var log = this.log;
      elm.update = function(app) {
        log._order.forEach(function(e) {
          var prop = log[e];
          if (prop.length) elm[e] = prop.shift();
        });
      };
      return this;
    },




  });
})(phina);