// Generated by CoffeeScript 1.3.3
(function() {

  define(function(require, exports, module) {
    var ConsoleView, FoldList, OutlineInfo, OutputSwitch, PseudoList, Resizer, StateList, StyleInfo, TreeOutline, addKeyboardListener, addMouseWheelListener, highlightSelector, listenKey, node, parallel, stopEvent, swapNodes, ua, _ref, _ref1, _ref2, _ref3;
    TreeOutline = require('lib/views/ui/treeoutline');
    StyleInfo = require('lib/views/ui/styleinfo');
    OutlineInfo = require('lib/views/outlineinfo');
    OutputSwitch = require('lib/views/outputswitch');
    Resizer = require('lib/views/ui/resizer');
    _ref = require('lib/models'), StateList = _ref.StateList, FoldList = _ref.FoldList, PseudoList = _ref.PseudoList;
    _ref1 = require('lib/utils'), node = _ref1.node, highlightSelector = _ref1.highlightSelector, swapNodes = _ref1.swapNodes, parallel = _ref1.parallel;
    _ref2 = require('ace/lib/event'), addMouseWheelListener = _ref2.addMouseWheelListener, stopEvent = _ref2.stopEvent;
    _ref3 = require('lib/keyboard'), addKeyboardListener = _ref3.addKeyboardListener, listenKey = _ref3.listenKey;
    ua = require('ace/lib/useragent');
    ConsoleView = Backbone.View.extend({
      className: 'app',
      template: require('lib/templates/console'),
      events: {
        'click .tool-back': 'showProjectList',
        'click .tool-settings': 'showSettings',
        'click .tool-refresh': 'reloadOutline',
        'click .tool-identify': 'identifyClient',
        'click .tool-inspect': 'startInspector',
        'click .tool-edit': 'editProject',
        'click .tool-embed': 'toggleApplicationMode',
        'click .tool-sidebyside': 'toggleIframeMode'
      },
      initialize: function(opt) {
        var baseUrl, oldTitle,
          _this = this;
        _.bindAll(this, 'onResize', 'toggleApplicationMode', 'onBeforeUnload', 'onConsoleDeactivated', 'onConsoleActivated', 'onClientMessage', 'toggleInfobar', 'onStartupData', 'toggleUpdateMode', 'toggleTabSettings', 'toggleSidebar', 'onInspectorResult', 'onElementSelected', 'onEmbedMessage');
        app.console = this;
        this.usesPostMessage = false;
        app.socket.on('activate', this.onConsoleActivated);
        app.socket.on('deactivate', this.onConsoleDeactivated);
        app.socket.on('clientmessage', this.onClientMessage);
        app.socket.on('startupdata', this.onStartupData);
        this.project = opt.project;
        this.project.on('clients:add', function(client) {
          if (_this.project.getClients().length === 1 && !_this.client) {
            return _this.loadClient(client);
          }
        });
        if (self !== top) {
          window.addEventListener('message', this.onEmbedMessage, false);
          top.postMessage('getEmbedMode', '*');
        }
        addKeyboardListener('global', window);
        listenKey(null, 'toggle-window-mode', {
          exec: this.toggleApplicationMode
        });
        listenKey(null, 'toggle-iframe-container', {
          exec: function() {
            return _this.callClient('toggleIframe', {});
          }
        });
        listenKey(null, 'focus-tree', {
          exec: function() {
            return _this.outline.el.focus();
          }
        });
        listenKey(null, 'focus-styleinfo', {
          exec: function() {
            return _this.styleInfo.el.focus();
          }
        });
        listenKey(null, 'focus-editor', {
          exec: function() {
            return _this.editor.focus();
          }
        });
        listenKey(null, 'focus-clientswitch', {
          exec: function() {
            return _this.clientPicker.el.focus();
          }
        });
        listenKey(null, 'settings', {
          exec: function() {
            return _this.showSettings();
          }
        });
        listenKey(null, 'select-focused-selector', {
          exec: function() {
            return _this.selectFocusedSelectorElement();
          }
        });
        listenKey(null, 'select-focused-selector-reverse', {
          exec: function() {
            return _this.selectFocusedSelectorElement(true);
          }
        });
        listenKey(null, 'back-to-project-list', {
          exec: function() {
            return _this.showProjectList();
          }
        });
        listenKey(null, 'toggle-infobar', {
          exec: this.toggleInfobar
        });
        listenKey(null, 'toggle-update-mode', {
          exec: this.toggleUpdateMode
        });
        listenKey(null, 'toggle-tab-mode', {
          exec: this.toggleTabSettings
        });
        listenKey(null, 'toggle-left-pane', {
          exec: this.toggleSidebar
        });
        this.$el.html(this.template).addClass('no-client-loaded');
        this.clientPicker = new OutputSwitch({
          model: this.project,
          el: this.$('.client-select-sidebar')[0]
        });
        this.clientPicker.on('change', this.onClientChange, this);
        this.clientPicker2 = new OutputSwitch({
          model: this.project,
          el: this.$('.client-select-toolbar')[0]
        });
        this.clientPicker2.on('change', this.onClientChange, this);
        this.outline = new TreeOutline({
          el: this.$('.elements-outline')[0]
        });
        this.outline.on('load', this.onOutlineLoaded, this);
        this.outline.on('select', _.throttle(_.bind(this.onElementSelected), 300));
        this.outline.on('fold', this.onFold, this);
        this.outline.on('unfold', this.onUnfold, this);
        this.outline.on('focus:styleinfo', function() {
          _this.styleInfo.el.focus();
          if (_this.styleInfo.highlightElement == null) {
            return _this.styleInfo.moveHighlight(1);
          }
        });
        this.styleInfo = new StyleInfo({
          el: this.$('.styleinfo')[0]
        });
        this.styleInfo.on('open', this.openFile, this);
        this.styleInfo.on('focus:outline', function() {
          return _this.outline.el.focus();
        });
        this.outlineInfo = new OutlineInfo({
          el: this.$('.infobar-outline')[0]
        });
        this.on('change:pseudo', function(pseudo) {
          return _this.setElementPseudo(pseudo.elementId, pseudo.get('pseudos'));
        });
        (new Resizer({
          el: this.$('.resizer-vertical')[0],
          name: 'vresizer',
          target: this.$('.styleinfo')[0]
        })).on('resize', this.onResize);
        (new Resizer({
          el: this.$('.resizer-horizontal')[0],
          name: 'hresizer',
          target: this.$('.sidebar')[0]
        })).on('resize', this.onResize);
        if (app.Settings.get('sidebar_right')) {
          swapNodes(this.$('.sidebar')[0], this.$('.main-content')[0]);
        }
        this.$('.sidebar-toggle').on('click', this.toggleSidebar);
        baseUrl = this.project.get('baseurl');
        this.$('.no-clients-fallback .url').text(baseUrl).on('click', function() {
          return window.open(baseUrl);
        });
        this.loadClient(opt.client);
        $(document.body).addClass('no-scrolling');
        addMouseWheelListener(document, function(e) {
          if (e.wheelX !== 0) {
            return stopEvent(e);
          }
        });
        $(window).on('beforeunload', this.onBeforeUnload);
        if (!ua.isGecko) {
          this.captureCommandStart = _.bind(this.captureCommandKey, this, false);
          this.captureCommandEnd = _.bind(this.captureCommandKey, this, true);
          window.addEventListener('keydown', this.captureCommandStart, true);
          window.addEventListener('keyup', this.captureCommandEnd, true);
        }
        Backbone.history.onbeforeunload = function() {
          var block;
          return block = _this.checkUnsavedFiles(function() {
            Backbone.history.onbeforeunload = null;
            if (block) {
              return window.history.back();
            }
          });
        };
        oldTitle = document.title.replace(/\s?\(\d+\)$/, '');
        document.title = oldTitle + (" (" + this.project.id + ")");
        tm('console');
        _.delay(function() {
          return require(['lib/editor/statsmanager'], function(stats) {
            return app.stats = stats;
          });
        }, 1000);
        if (app.Settings.get('fpsstats')) {
          require(['vendor/stats'], function() {
            var stats, statsElement;
            stats = new Stats();
            statsElement = stats.getDomElement();
            $(statsElement).addClass('fpsstats');
            _this.$el.append(statsElement);
            return setInterval(function() {
              return stats.update();
            }, 1000 / 60);
          });
        }
        return _.delay(function() {
          return require(['lib/views/commandline'], function(CommandLine) {
            return new CommandLine({
              el: _this.$('.cli-container')[0]
            });
          });
        }, 1000);
      },
      activateConsole: function() {
        var states, _ref4,
          _this = this;
        tm('activateConsole');
        app.socket.emit('activate', this.project.id, (_ref4 = this.client) != null ? _ref4.id : void 0);
        if (this.state) {
          return this.initState();
        } else {
          states = new StateList(null, {
            backend: 'state-' + this.project.id
          });
          if (__data.states) {
            states.reset(__data.states);
            this.state = states.at(0);
            console.log(this.state);
            this.initState();
            return __data.states = null;
          } else {
            return states.fetch({
              success: function() {
                _this.state = states.at(0);
                return _this.initState();
              }
            });
          }
        }
      },
      initState: function() {
        var sp,
          _this = this;
        tm('initstate');
        sp = this.state.get('scrollPos');
        if (sp) {
          this.outline.scrollPosition = sp;
        }
        this.state.on('change:infobarVisible', this.renderInforbarVisibility, this);
        this.renderInforbarVisibility();
        this.state.on('change:outlineLock', this.renderFocusLocking, this);
        this.renderFocusLocking();
        this.state.on('change:leftPaneVisible', this.renderSidebarVisibility, this);
        this.renderSidebarVisibility();
        return _.defer(function() {
          return require(['lib/views/editor'], function(EditorView) {
            tm('editorload');
            if (!_this.editor) {
              _this.editor = new EditorView({
                el: _this.$('.editor-container')[0]
              });
              _this.editor.on('change:focusedselector', _this.onFocusedSelectorChange, _this);
            }
            _this.$('.infobar-toggle').on('click', _this.toggleInfobar);
            _this.$('.locking-toggle').on('click', function() {
              return _this.state.save({
                outlineLock: !_this.state.get('outlineLock')
              });
            });
            _this.usesPostMessage = false;
            _this.callClientPostMessage('getSessionId', {}, function(resp) {
              if (parseInt(resp.sessionId, 10) === _this.client.get('session_id')) {
                return _this.usesPostMessage = true;
              }
            });
            return _.delay(function() {
              _this.reloadOutline();
              if (_this.getMedia() !== 'screen') {
                _this.callClient('setMedia', {
                  value: _this.getMedia()
                }, function() {});
              }
              return _this.trigger('change:media');
            }, 50);
          });
        });
      },
      onConsoleActivated: function() {
        tm('activated');
        return this.active = true;
      },
      onConsoleDeactivated: function() {
        var _this = this;
        this.backupData();
        this.active = false;
        require(['lib/views/warning-screen'], function(WarningScreen) {
          if (_this.embed) {
            top.postMessage('close-iframe', '*');
          }
          return new WarningScreen({
            name: 'warning_overload'
          });
        });
        return this.destroy();
      },
      destroy: function() {
        var _ref4;
        this.unloadClient();
        if (this.active) {
          app.socket.emit('deactivate');
        }
        app.socket.removeListener('activate', this.onConsoleActivated);
        app.socket.removeListener('deactivate', this.onConsoleDeactivated);
        app.socket.removeListener('clientmessage', this.onClientMessage);
        app.socket.removeListener('startupdata', this.onStartupData);
        $(document.body).removeClass('no-scrolling');
        $(window).off('beforeunload', this.onBeforeUnload);
        window.removeEventListener('keydown', this.captureCommandStart, true);
        window.removeEventListener('keyup', this.captureCommandEnd, true);
        document.title = '' + document.title.replace(/\s*?\(\d+\)$/, '');
        if ((_ref4 = this.editor) != null) {
          _ref4.destroy();
        }
        return app.console = null;
      },
      toggleSidebar: function() {
        var _this = this;
        this.state.save({
          leftPaneVisible: !this.state.get('leftPaneVisible')
        });
        return _.delay(function() {
          return _this.editor.onResize();
        }, 1000);
      },
      toggleInfobar: function() {
        return this.state.save({
          infobarVisible: !this.state.get('infobarVisible')
        });
      },
      toggleUpdateMode: function() {
        return this.project.save({
          mode: (this.project.get('mode') ? 0 : 1)
        });
      },
      toggleTabSettings: function() {
        var softTabs, tabSize;
        tabSize = this.project.get('tabSize');
        softTabs = this.project.get('softTabs');
        switch (tabSize) {
          case 2:
            tabSize = 3;
            break;
          case 3:
            tabSize = 4;
            break;
          case 4:
            tabSize = 8;
            break;
          case 8:
            tabSize = 2;
            softTabs = !softTabs;
        }
        return this.project.save({
          tabSize: tabSize,
          softTabs: softTabs
        });
      },
      toggleApplicationMode: function() {
        return this.callClient('toggleApplicationMode', null, function() {
          return window.close();
        });
      },
      toggleIframeMode: function() {
        if (this.embed) {
          return top.postMessage('toggleIframeMode', '*');
        }
      },
      onEmbedMessage: function(e) {
        if (e.data.embedInfo) {
          if (e.data.iframeMode) {
            this.embedSideBySide = e.data.iframeMode === 'sidebyside';
          }
          if (e.data.baseURL) {
            this.embed = e.data.baseURL === this.project.get('baseurl');
          }
          return this.renderEmbedMode();
        }
      },
      renderEmbedMode: function() {
        if (this.embed) {
          this.$('.tool-embed').addClass('is-selected');
          return this.$('.tool-sidebyside').show().toggleClass('is-selected', !!this.embedSideBySide);
        } else {
          this.$('.tool-embed').toggle(this.client && this.client.get('embed'));
          return this.$('.tool-sidebyside').hide();
        }
      },
      renderInforbarVisibility: function() {
        return this.$el.toggleClass('has-infobar', this.state.get('infobarVisible'));
      },
      renderFocusLocking: function() {
        return this.$('.locking-toggle').toggleClass('is-locked', this.state.get('outlineLock'));
      },
      renderSidebarVisibility: function() {
        var leftPaneVisible;
        leftPaneVisible = this.state.get('leftPaneVisible');
        return this.$el.toggleClass('no-sidebar', !leftPaneVisible).toggleClass('has-sidebar', leftPaneVisible);
      },
      showProjectList: function() {
        var _this = this;
        return this.checkUnsavedFiles(function() {
          var _ref4;
          if ((_ref4 = _this.client) != null ? _ref4.get('project') : void 0) {
            return app.router.navigate('project/' + _this.client.get('project'), {
              trigger: true
            });
          } else {
            return app.router.navigate('', {
              trigger: true
            });
          }
        });
      },
      editProject: function() {
        var _this = this;
        return this.checkUnsavedFiles(function() {
          return app.router.navigate('edit/' + _this.project.id, {
            trigger: true
          });
        });
      },
      startInspector: function() {
        var _ref4;
        this.callClient('startInspector', {}, this.onInspectorResult);
        if (this.usesPostMessage) {
          if ((_ref4 = window.opener) != null) {
            _ref4.focus();
          }
        }
        return app.socket.emit('callClient', this.client.id, 'focus');
      },
      onInspectorResult: function(data) {
        this._dontInspectOutline = true;
        this._wasSelectFromInspect = true;
        this.outline.select(data.id);
        return app.socket.emit('callClient', this.client.id, 'focus', {
          title: this.project.id
        });
      },
      showSettings: function() {
        return app.app.showSettings();
      },
      identifyClient: function() {
        this.callClient('identify', {
          msg: this.client.get('useragent')
        }, function() {});
        return app.socket.emit('callclient', this.client.id, 'focus');
      },
      reloadOutline: function() {
        var _this = this;
        tm('reload');
        return this.callClient('getDOMTree', {}, function(data) {
          _this._wasSilentRefresh = false;
          _this.outline.setTreeData(data.tree);
          return tm('treedata');
        });
      },
      captureCommandKey: function(release, e) {
        if (e.keyCode === (ua.isMac ? 91 : 17)) {
          return this.iscommandkey = !release;
        } else if (e.keyCode === 87) {
          return this.iswkey = !release;
        } else if (e.keyCode === 16) {
          return this.isshiftkey = !release;
        }
      },
      onBeforeUnload: function(e) {
        var confirm_keyboard_close, confirm_unsaved_close, fileNames, unsavedTabs;
        confirm_keyboard_close = app.Settings.get('confirm_keyboard_close');
        if (this.iscommandkey && confirm_keyboard_close && this.editor.tabs.size() && !this.isshiftkey) {
          this.iscommandkey = false;
          return ['Possibly incorrect action was detected! Closing editor tabs with', ua.isMac ? ' ⌘W' : 'Ctrl-W', 'is not supported by your browser. Use alternative keyboard command', ua.isMac ? '⌃W' : 'Alt-W', 'instead. If you like the default behaviour of your browser you can turn off this message from the settings or include Shift key in your command.'].join(' ');
        }
        confirm_unsaved_close = app.Settings.get('confirm_unsaved_close');
        unsavedTabs = this.editor.getUnsavedTabs();
        if (!(unsavedTabs.length && confirm_unsaved_close)) {
          return;
        }
        fileNames = _.map(unsavedTabs, function(tab) {
          return tab.get('name');
        });
        return 'You have unsaved changes in file(s): ' + fileNames.join(', ') + '. Closing the window will destroy the changes.';
      },
      checkUnsavedFiles: function(cb) {
        var confirmUnsavedClose, names, unsaved,
          _this = this;
        confirmUnsavedClose = app.Settings.get('confirm_unsaved_close');
        if (!this.editor) {
          return;
        }
        unsaved = this.editor.getUnsavedTabs();
        if (!(unsaved.length && confirmUnsavedClose)) {
          cb();
          return false;
        }
        names = _.map(unsaved, function(tab) {
          return tab.get('name');
        });
        require(['lib/views/ui/popup'], function(Popup) {
          return new Popup({
            msg: 'You have unsaved changes in file(s): ' + names.join(', ') + '. Do you want to save those changes?',
            buttons: [
              {
                id: 'no',
                txt: 'Don\'t save',
                exec: function() {
                  return cb();
                }
              }, {
                id: 'cancel',
                txt: 'Cancel',
                exec: function() {
                  return _this.editor.focus();
                }
              }, {
                id: 'yes',
                txt: 'Save all',
                highlight: true,
                exec: function() {
                  return _this.editor.saveAll(function() {
                    return cb();
                  });
                }
              }
            ]
          });
        });
        return true;
      },
      onStartupData: function(data) {
        var _ref4;
        this.startupData = data;
        return (_ref4 = this.editor) != null ? _ref4.tabs.each(function(tab) {
          return this.tab.tryLoadStartupData();
        }) : void 0;
      },
      backupData: function() {
        var unsavedData, _ref4;
        unsavedData = (_ref4 = this.editor) != null ? _ref4.tabs.map(function(tab) {
          return {
            url: tab.get('url'),
            position: tab.session.selection.getCursor(),
            data: tab.session.getValue(),
            scrollTop: tab.session.getScrollTop(),
            scrollLeft: tab.session.getScrollLeft()
          };
        }) : void 0;
        if (unsavedData.length) {
          return app.socket.emit('backup', unsavedData);
        }
      },
      openFile: function(url, selector, index, property) {
        if (selector == null) {
          selector = null;
        }
        if (index == null) {
          index = 0;
        }
        if (property == null) {
          property = null;
        }
        return this.editor.openFile(url, selector, index, property);
      },
      getCurrentFile: function() {
        var _ref4, _ref5;
        return (_ref4 = this.editor) != null ? (_ref5 = _ref4.tabs.selectedTab()) != null ? _ref5.get('url') : void 0 : void 0;
      },
      isLiveMode: function() {
        return !!this.project.get('mode');
      },
      onResize: function() {
        this.outline.onResize();
        return this.editor.onResize();
      },
      onClientConnectedChange: function(client) {
        if (client.get('connected')) {
          return this.activateConsole();
        }
      },
      onClientRemoved: function(client) {
        var _this = this;
        return _.delay(function() {
          var clients;
          clients = _this.project.getClients();
          if (clients.length) {
            return app.router.navigate('' + clients[0].get('session_id'), {
              trigger: true
            });
          } else {
            return app.router.navigate('' + _this.project.id, {
              trigger: true
            });
          }
        });
      },
      unloadClient: function() {
        if (this.client) {
          this.client.off('change:connected', this.onClientConnectedChange, this);
          this.client.off('remove', this.onClientRemoved, this);
          this.clearElementPseudos();
          this.clearClientMedia();
          return this.callClient('setMedia', {
            value: 'screen'
          }, function() {});
        }
      },
      loadClient: function(client) {
        var _ref4, _ref5;
        this._wasSilentRefresh = false;
        this.clientPicker.select(client);
        this.clientPicker2.select(client);
        if (client) {
          this.$('.sidebar').removeClass('no-clients');
        } else {
          this.outline.setTreeData([]);
          this.styleInfo.setStyleData(0, [], []);
          this.$('.sidebar').addClass('no-clients');
        }
        this.unloadClient();
        this.client = client;
        if ((_ref4 = this.client) != null) {
          _ref4.on('change:connected', this.onClientConnectedChange, this);
        }
        if ((_ref5 = this.client) != null) {
          _ref5.on('remove', this.onClientRemoved, this);
        }
        this.renderEmbedMode();
        return this.activateConsole();
      },
      onClientChange: function(client) {
        var _ref4;
        if (!client || (client != null ? client.id : void 0) === ((_ref4 = this.client) != null ? _ref4.id : void 0)) {
          return;
        }
        app.router.navigate('' + client.get('session_id'), {
          trigger: true
        });
        return this.trigger('change:client');
      },
      onFocusedSelectorChange: function(selector, selectFirst) {
        var _this = this;
        if (selectFirst == null) {
          selectFirst = false;
        }
        this.focusedSelector = selector;
        console.log('selectorchange', selector);
        return this.elementsForSelector(selector, function(ids) {
          console.log('done');
          _this.outline.highlight(ids);
          _this.focusedSelectorElements = ids;
          if ((selectFirst || _this.state.get('outlineLock')) && ids.length) {
            _this.outline.select(ids[0]);
          }
          _this.processFocus();
          return _this.trigger('change:focusedselector');
        });
      },
      processFocus: function() {
        var dfocus, dhint, dhintinner, dinfo, dselector, haselements, index, key, selectedId, _ref4;
        selectedId = this.outline.selectedId();
        dfocus = this.$('.editor-info > .selected-rule');
        dfocus.addClass('is-visible');
        dselector = dfocus.find('.selector');
        dinfo = dfocus.find('.selector-elements');
        dhint = dfocus.find('.selection-hint');
        dhintinner = dhint.find('.inner');
        dselector.empty();
        dselector.append(this.focusedSelector ? highlightSelector(this.focusedSelector) : '');
        haselements = !!((_ref4 = this.focusedSelectorElements) != null ? _ref4.length : void 0);
        if (haselements) {
          dinfo.show();
          dhint.show();
          index = this.focusedSelectorElements.indexOf(selectedId);
          key = ua.isMac ? '⌘I' : 'Ctrl-I';
          if (index === -1) {
            dinfo.text(this.focusedSelectorElements.length + ' element' + (this.focusedSelectorElements.length > 1 ? 's' : '') + ' match' + (this.focusedSelectorElements.length > 1 ? '' : 'es'));
            dhintinner.text("" + key + " to select");
            dfocus.closest('.infobar').removeClass('is-binded');
          } else {
            dfocus.closest('.infobar').addClass('is-binded');
            if (this.focusedSelectorElements.length === 1) {
              dinfo.text('selected');
              dhint.hide();
            } else {
              dinfo.text("" + (index + 1) + " of " + this.focusedSelectorElements.length);
              dhintinner.text("" + key + " for next");
            }
          }
        } else {
          dinfo.text('No elements match');
          dhint.hide();
          dinfo.hide();
          dfocus.closest('.infobar').removeClass('is-binded');
        }
        if (!this.focusedSelector) {
          dfocus.removeClass('visible');
          return dfocus.closest('.infobar').removeClass('is-binded');
        }
      },
      selectFocusedSelectorElement: function(reverse) {
        var index, _ref4;
        if (reverse == null) {
          reverse = false;
        }
        if (!(this.focusedSelector && ((_ref4 = this.focusedSelectorElements) != null ? _ref4.length : void 0))) {
          return;
        }
        index = this.focusedSelectorElements.indexOf(this.outline.selectedId());
        if (index === -1 || this.focusedSelectorElements.length === 1) {
          return this.outline.select(this.focusedSelectorElements[0]);
        } else {
          if (reverse) {
            index--;
          } else {
            index++;
          }
          if (index < 0) {
            index = this.focusedSelectorElements.length - 1;
          }
          if (index >= this.focusedSelectorElements.length) {
            index = 0;
          }
          return this.outline.select(this.focusedSelectorElements[index]);
        }
      },
      onElementSelected: function(i) {
        var _this = this;
        this.serializeElement(i.id, function(selector) {
          _this.state.save({
            selectedItem: selector || null
          });
          _this.trigger('load:selector', i.id, selector);
          _this.selector = selector;
          _this.getStyles(i.id);
          if ((_this._wasSelectFromInspect && !_this.state.get('leftPaneVisible')) || i.openFirst) {
            _this.styleInfo.openStyleAtIndex(0);
          }
          return _this._wasSelectFromInspect = false;
        });
        if (!this._dontInspectOutline) {
          this.callClient('showInspectArea', {
            id: i.id
          });
        }
        this._dontInspectOutline = false;
        return this.processFocus();
      },
      onOutlineLoaded: function() {
        var _this = this;
        this.initPseudos(function() {});
        return this.initFolds(function() {
          var selectedItem;
          if ((selectedItem = _this.state.get('selectedItem')) !== null) {
            return _this.unserializeElement(selectedItem, function(id) {
              if (id === -1 && _this._wasSilentRefresh === true) {
                return _this.callClient('getLastStyledElement', {}, function(resp) {
                  return _this.selectElement(resp.lastStyledElement);
                });
              } else {
                return _this.selectElement(id);
              }
            });
          } else {
            return _this.selectElement(-1);
          }
        });
      },
      selectElement: function(elementId) {
        this._dontInspectOutline = true;
        if (elementId !== -1) {
          this.outline.select(elementId, false);
        } else {
          this.outline.selectAt(0);
        }
        return this.outline.restoreScrollPosition();
      },
      serializeElement: function(elementId, cb) {
        return this.callClient('serializeElement', {
          id: elementId
        }, function(resp) {
          return cb(resp);
        });
      },
      unserializeElement: function(selector, cb) {
        return this.callClient('unserializeElement', selector, function(resp) {
          return cb(resp ? resp.id : -1);
        });
      },
      selectParentAtIndex: function(index) {
        if (index) {
          return this.outline.selectParent(index);
        }
      },
      elementsForSelector: function(selector, cb) {
        if (this.client) {
          return this.callClient('elementsForSelector', {
            selector: selector
          }, function(data) {
            return cb(data.ids);
          });
        } else {
          return _.defer(function() {
            return cb(null);
          });
        }
      },
      getStyles: function(id) {
        var _this = this;
        return this.callClient('getStyles', {
          id: id
        }, function(resp) {
          var rules, sdata;
          _this.styleInfo.selectedElement = id;
          _this.styleInfo.setStyleData(id, resp.styles, resp.nearby, _this.selector);
          rules = (function() {
            var _i, _len, _ref4, _results;
            _ref4 = resp.styles;
            _results = [];
            for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
              sdata = _ref4[_i];
              if (sdata.file) {
                _results.push([sdata.file, sdata.selector]);
              }
            }
            return _results;
          })();
          _this.trigger('load:styles', id, rules);
          _this.processFocus();
          _this.editor.highlight(rules);
          return _this.$el.removeClass('no-client-loaded');
        });
      },
      onStylesChanged: function(data) {
        var _this = this;
        if (this.styleInfo.selectedElement === data.id) {
          return this.serializeElement(data.id, function(selector) {
            return _this.styleInfo.setStyleData(data.id, data.styles, data.nearby, selector);
          });
        }
      },
      getMedia: function() {
        return this.media || 'screen';
      },
      setMedia: function(media) {
        this.media = media;
        this.trigger('change:media');
        return this.callClient('setMedia', {
          value: this.media
        }, function() {});
      },
      clearClientMedia: function() {
        return this.callClient('setMedia', {
          value: 'screen'
        }, function() {});
      },
      initPseudos: function(cb) {
        var _this = this;
        if (!this.pseudos) {
          this.pseudos = new PseudoList(null, {
            backend: 'pseudos-' + this.project.id
          });
          this.pseudos.on('change', function(pseudo) {
            return _this.trigger('change:pseudo', pseudo);
          });
        }
        return this.pseudos.fetch({
          success: function() {
            if (!_this.pseudos.size()) {
              return cb();
            }
            return parallel(_this.pseudos.toArray(), function(pseudo, done) {
              return _this.unserializeElement(pseudo.get('selector'), function(id) {
                if (id === -1 || !pseudo.get('pseudos').length) {
                  pseudo.destroy();
                } else {
                  pseudo.elementId = id;
                  _this.trigger('change:pseudo', pseudo);
                }
                return done();
              });
            }, function() {
              return cb();
            });
          }
        });
      },
      setPseudoValue: function(id, dataClass, bool) {
        var classes, pseudo,
          _this = this;
        pseudo = this.pseudos.find(function(p) {
          return p.elementId === id;
        });
        if (pseudo) {
          classes = pseudo.get('pseudos');
          if (bool == null) {
            bool = !_.include(classes, dataClass);
          }
          if (bool) {
            return pseudo.save({
              pseudos: _.union(classes, dataClass)
            });
          } else {
            return pseudo.save({
              pseudos: _.without(classes, dataClass)
            });
          }
        } else if (bool !== false) {
          return this.serializeElement(id, function(data) {
            return _this.pseudos.create({
              selector: data,
              pseudos: [dataClass]
            }, {
              wait: true,
              success: function(pseudo) {
                pseudo.elementId = id;
                return _this.trigger('change:pseudo', pseudo);
              }
            });
          });
        }
      },
      setElementPseudo: function(id, pseudos) {
        var _this = this;
        return this.callClient('setElementPseudo', {
          id: id,
          pseudos: pseudos
        }, function() {
          return _this.getStyles(_this.outline.selectedId());
        });
      },
      clearElementPseudos: function() {
        return this.callClient('clearPseudos', {}, function() {});
      },
      initFolds: function(cb) {
        var _this = this;
        this.folds = new FoldList(null, {
          backend: 'folds-' + this.project.id
        });
        return this.folds.fetch({
          success: function() {
            if (!_this.folds.size()) {
              return cb();
            }
            return parallel(_this.folds.toArray(), function(f, done) {
              return _this.unserializeElement(f.toJSON(), function(id) {
                var index;
                if (id === -1) {
                  f.destroy();
                } else {
                  if (-1 !== (index = _this.outline.getIndex(id))) {
                    if (f.get('type') === 'fold') {
                      _this.outline.foldAt(index, true);
                    } else {
                      _this.outline.unfoldAt(index, true);
                    }
                  }
                }
                return done();
              });
            }, cb);
          }
        });
      },
      getFold: function(data) {
        return this.folds.find(function(f) {
          return data && data.selector === f.get('selector') && data.length === f.get('length') && data.index === f.get('index');
        });
      },
      onFold: function(item) {
        var _this = this;
        return this.serializeElement(item.id, function(data) {
          if (data && !_this.getFold(data)) {
            data.type = 'fold';
            return _this.folds.create(data);
          }
        });
      },
      onUnfold: function(item) {
        var _this = this;
        return this.serializeElement(item.id, function(data) {
          var f;
          if (data) {
            if (f = _this.getFold(data)) {
              return f != null ? f.destroy() : void 0;
            } else {
              data.type = 'unfold';
              return _this.folds.create(data);
            }
          }
        });
      },
      callAPI: function(name, params, cb) {
        if (!this.active) {
          return;
        }
        return app.socket.emit('callAPI', name, params, cb);
      },
      callClient: function(name, param, cb) {
        var _ref4;
        if (!((_ref4 = this.client) != null ? _ref4.get('connected') : void 0)) {
          return;
        }
        if (this.usesPostMessage) {
          return this.callClientPostMessage(name, param, cb);
        } else {
          return app.socket.emit('callclient', this.client.id, name, param, cb);
        }
      },
      callClientPostMessage: function(name, param, cb) {
        var _ref4;
        return (_ref4 = window.opener) != null ? typeof _ref4.postMessage === "function" ? _ref4.postMessage({
          name: name,
          param: param,
          callbackId: this.getPostMessageId(cb)
        }, this.project.get('baseurl')) : void 0 : void 0;
      },
      getPostMessageId: (function() {
        var callbacks, receive;
        callbacks = {};
        receive = function(e) {
          var data, func, id, view, _ref4;
          data = e.data;
          if ((data != null ? data.name : void 0) !== 'messageResponse') {
            return;
          }
          id = data != null ? data.callbackId : void 0;
          if (id) {
            _ref4 = callbacks[id], func = _ref4[0], view = _ref4[1];
            if ((view.project.get('baseurl').indexOf(e.origin)) === 0) {
              return typeof func === "function" ? func(data.data) : void 0;
            }
          }
        };
        window.addEventListener('message', receive, false);
        return function(func) {
          var id;
          id = ~~(Math.random() * 1e8);
          callbacks[id] = [func, this];
          return id;
        };
      })(),
      onClientMessage: function(name, data) {
        switch (name) {
          case 'inspect':
            return this.onInspectorResult(data);
          case 'change:styles':
            return this.onStylesChanged(data);
          case 'change:dom':
            this._wasSilentRefresh = true;
            return this.outline.setTreeData(data.tree);
          case 'change:media':
            return this.setMedia(data.media);
        }
      }
    });
    return module.exports = ConsoleView;
  });

}).call(this);
