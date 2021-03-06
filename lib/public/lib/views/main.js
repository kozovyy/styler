// Generated by CoffeeScript 1.3.3
(function() {

  define(function(require, exports, module) {
    var MainView, ProjectListView;
    require('vendor/link!css/main.css');
    ProjectListView = require("lib/views/projectlist");
    MainView = Backbone.View.extend({
      template: require("lib/templates/main"),
      className: "fpage",
      events: {
        "click .instructions-opener": "openInstructions"
      },
      initialize: function() {
        this.plv = new ProjectListView({
          collection: app.Projects
        });
        app.Projects.on("add", this.render, this);
        app.Projects.on("reset", this.render, this);
        return app.Projects.on("remove", this.render, this);
      },
      openInstructions: function() {
        this.$('.instructions-opener').removeClass('visible');
        return this.$('.instructions-container').addClass('visible');
      },
      render: function() {
        var bookmark, bookmark_source, inject;
        this.$el.html(this.template({
          num_projects: app.Projects.length
        }));
        this.$('.projects-list').append(this.plv.render().el);
        bookmark = this.$(".bookmarklet")[0];
        if (bookmark) {
          bookmark_source = require("vendor/text!lib/bookmarklet.js");
          bookmark_source = bookmark_source.replace(/\/\/.*$/mi, '');
          bookmark_source = bookmark_source.replace("#origin", window.location.protocol + '//' + window.location.host);
          bookmark.setAttribute("href", "javascript:" + bookmark_source);
        }
        inject = this.$(".injected_code")[0];
        if (inject) {
          inject.innerHTML = '<script type="text/javascript" src="' + window.location.protocol + '//' + window.location.host + '/styler.js"></script>';
        }
        this.$('.instructions-opener').toggleClass('visible', !!app.Projects.size());
        this.$('.instructions-container').toggleClass('visible', !app.Projects.size());
        return this;
      }
    });
    return module.exports = MainView;
  });

}).call(this);
