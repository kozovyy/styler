// Generated by CoffeeScript 1.3.3
(function() {
  var Backbone, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    _ = require('underscore')._;
    Backbone = require('backbone');
  } else {
    _ = this._, Backbone = this.Backbone;
  }

  Backbone.syncCallback = function(name, method, data, options) {
    var collection, _i, _len, _ref, _results;
    if (!Backbone.Collection["_listeners_" + name]) {
      return;
    }
    _ref = Backbone.Collection["_listeners_" + name];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      collection = _ref[_i];
      _results.push(collection['_' + method](data, options));
    }
    return _results;
  };

  Backbone.Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.getBackend = function() {
      var _ref;
      return this.backend || ((_ref = this.collection) != null ? _ref.backend : void 0);
    };

    return Model;

  })(Backbone.Model);

  Backbone.Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection(models, options) {
      if (options != null ? options.backend : void 0) {
        this.backend = options.backend;
      }
      Collection.__super__.constructor.call(this, models, options);
      if (this.backend) {
        this.listen();
      }
    }

    Collection.prototype.getBackend = function() {
      return this.backend;
    };

    Collection.prototype.notify = {
      all: function() {
        return true;
      },
      none: function() {
        return false;
      },
      self: function(clientId, options) {
        return clientId === (options != null ? options.clientId : void 0);
      },
      others: function(clientId, options) {
        return clientId !== (options != null ? options.clientId : void 0);
      }
    };

    Collection.prototype._update = function(model, options) {
      var _ref;
      if (this.notify[options.notify](this.clientId, options)) {
        if (model != null) {
          return (_ref = this.get(model.id)) != null ? _ref.set(model, options) : void 0;
        }
      }
    };

    Collection.prototype._create = function(model, options) {
      if (this.notify[options.notify](this.clientId, options)) {
        if (model != null) {
          return this.add(model, options);
        }
      }
    };

    Collection.prototype._delete = function(model, options) {
      if (this.notify[options.notify](this.clientId, options)) {
        if (model != null) {
          return this.remove(model, options);
        }
      }
    };

    Collection.prototype._read = function(data, options, success) {};

    Collection.prototype.listen = function() {
      var lname, name;
      this.clientId = ~~(Math.random() * 10e6);
      name = this.backend;
      lname = "_listeners_" + name;
      if (!Backbone.Collection[lname]) {
        Backbone.Collection[lname] = [];
      }
      return Backbone.Collection[lname].push(this);
    };

    return Collection;

  })(Backbone.Collection);

  Backbone.sync = function(method, model, options) {
    var backend, success, _ref;
    backend = model != null ? typeof model.getBackend === "function" ? model.getBackend() : void 0 : void 0;
    if (!backend) {
      return;
    }
    success = options.success;
    delete options.success;
    delete options.error;
    if (options.notify == null) {
      options.notify = 'others';
    }
    options.clientId = (_ref = model.collection) != null ? _ref.clientId : void 0;
    try {
      if (!(typeof io !== "undefined" && io !== null)) {
        return Backbone.serverSync(method, backend, model.attributes, options, success);
      } else {
        return app.socket.emit('serverSync', method, backend, model.attributes, options, success);
      }
    } catch (e) {
      return model.trigger('error', model, e, options);
    }
  };

}).call(this);
