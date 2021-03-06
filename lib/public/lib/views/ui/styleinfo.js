// Generated by CoffeeScript 1.3.3
(function() {

  define(function(require, exports, module) {
    var StyleInfo, addKeyboardListener, basename, highlightSelector, listenKey, node, rgbToHex, _ref, _ref1;
    require('vendor/link!css/styleinfo.css');
    _ref = require('lib/utils'), node = _ref.node, basename = _ref.basename, highlightSelector = _ref.highlightSelector, rgbToHex = _ref.rgbToHex;
    _ref1 = require('lib/keyboard'), addKeyboardListener = _ref1.addKeyboardListener, listenKey = _ref1.listenKey;
    StyleInfo = Backbone.View.extend({
      initialize: function() {
        var i, _i, _results,
          _this = this;
        _.bindAll(this, 'onItemClick');
        this.states = {};
        this.currentState = {};
        this.$el.append([
          this.items = node('div', {
            "class": 'style-items'
          }), node('div', {
            "class": 'no-items-fallback'
          }, 'No element is selected.')
        ]);
        addKeyboardListener('styleinfo', this.el);
        this.el.listenKey('style-item-down', {
          exec: function() {
            return _this.moveHighlight(1);
          }
        });
        this.el.listenKey('style-item-up', {
          exec: function() {
            return _this.moveHighlight(-1);
          }
        });
        this.el.listenKey('style-item-expand', {
          exec: function() {
            return _this.expand(true);
          }
        });
        this.el.listenKey('style-item-collapse', {
          exec: function() {
            return _this.expand(false);
          }
        });
        this.el.listenKey('style-item-open', {
          exec: function() {
            return _this.open();
          }
        });
        this.el.listenKey('switch-back-to-outline', {
          exec: function() {
            return _this.trigger('focus:outline');
          }
        });
        this.el.listenKey('style-selector-up', {
          exec: function() {
            return _this.moveHighlight(-1, true);
          }
        });
        this.el.listenKey('style-selector-down', {
          exec: function() {
            return _this.moveHighlight(1, true);
          }
        });
        _results = [];
        for (i = _i = 1; _i <= 9; i = ++_i) {
          _results.push(listenKey(null, "open-style-" + i, {
            mac: "Command-Alt-" + i,
            win: "Ctrl-Shift-" + i,
            exec: _.bind(this.openStyleAtIndex, this, i - 1)
          }));
        }
        return _results;
      },
      openStyleAtIndex: function(i) {
        var el;
        if (!(el = $(this.$('.file').get(i)).next()[0])) {
          return;
        }
        this.highlight(el);
        return this.open();
      },
      moveHighlight: function(delta, selectorOnly) {
        var index, opt;
        if (selectorOnly == null) {
          selectorOnly = false;
        }
        opt = this.$('.name' + (selectorOnly ? '' : ',.style-prop:first-child,.style-prop-container.is-expanded .style-prop-sub'));
        if (!this.highlightElement) {
          this.highlightElement = opt[0];
        }
        index = opt.indexOf(this.highlightElement);
        if (index === -1) {
          index = 0;
        }
        index += delta;
        if (index >= opt.length) {
          index = 0;
        }
        if (index < 0) {
          index = opt.length - 1;
        }
        this.highlight(opt[index]);
        if (event) {
          event.stopPropagation();
          return event.preventDefault();
        }
      },
      expand: function(expand) {
        if (!(this.highlightElement && $(this.highlightElement).hasClass('propitem'))) {
          return;
        }
        return $(this.highlightElement.parentNode).toggleClass('expanded', expand);
      },
      openImage: function(urlvalue) {
        var url, _ref2;
        url = (urlvalue.match(/^url\(['"]?(.*)["']?\)$/i))[1];
        if ((_ref2 = this.infoTip) != null) {
          _ref2.hide();
        }
        return require(['lib/views/ui/imagepreview'], function(ImagePreview) {
          return new ImagePreview(url);
        });
      },
      showImageInfo: function(urlvalue, e) {
        var url,
          _this = this;
        url = (urlvalue.match(/^url\(['"]?(.*)["']?\)$/i))[1];
        return require(['lib/views/ui/infotip', 'lib/views/ui/imagepreview'], function(infoTip, ImagePreview) {
          _this.infoTip = infoTip;
          return infoTip.showPanel(e, 130, 100, function(cb) {
            return ImagePreview.getPreviewElement(url, 120, 70, function(err, el) {
              if (err) {
                return;
              }
              return cb(el);
            });
          });
        });
      },
      createValueElement: function(value) {
        var fragment, i,
          _this = this;
        fragment = node('span', {
          "class": 'style-prop-value'
        });
        i = 0;
        value.replace(/#[a-f\d]{3,6}|rgba?\([\d,\.\s]{5,}\)|url\([\w'":\/\.\?_@-]{5,}\)|'.*?'|".*?"|-?[\d\.]+(?:px|em|ex|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|\%)(?:\b|;)/gi, function(match, offset) {
          var num, spanurl, valuePart, _ref2;
          if (i < offset) {
            fragment.appendChild(node('span', value.substring(i, offset)));
          }
          valuePart = value.substr(offset, match.length);
          if (match.slice(0, 3).toLowerCase() === 'url') {
            fragment.appendChild(spanurl = node('span', {
              "class": 'url'
            }, valuePart));
            $(spanurl).on('click', _.bind(_this.openImage, _this, valuePart)).on('mouseover', _.bind(_this.showImageInfo, _this, valuePart));
          } else if ((_ref2 = match[0]) === '"' || _ref2 === "'") {
            fragment.appendChild(node('span', {
              "class": 'quoted'
            }, valuePart));
          } else if (num = match.match(/^[\d-\.]+/)) {
            fragment.appendChild(node('span', {
              "class": 'numeric'
            }, node('span', {
              "class": 'value'
            }, value.substr(offset, num[0].length)), value.substr(offset + num[0].length, match.length - num[0].length)));
          } else {
            fragment.appendChild(node('span', {
              "class": 'color-sample',
              style: {
                background: match
              }
            }));
            fragment.appendChild(node('span', {
              "class": 'color-name'
            }, rgbToHex(valuePart)));
          }
          return i = offset + match.length;
        });
        if (i < value.length) {
          fragment.appendChild(node('span', value.substring(i, value.length)));
        }
        return fragment;
      },
      focusSelector: function(sel, force) {
        var _this = this;
        if (force == null) {
          force = false;
        }
        if (sel === this.lastFocus && !force) {
          return;
        }
        this.$('.name').each(function(i, el) {
          var $el;
          $el = $(el);
          if ($el.attr('data-selector') === sel && !$el.closest('.style-item').hasClass('is-focused')) {
            return _this.highlight(el);
          }
        });
        return this.lastFocus = sel;
      },
      _onInheritedElementClick: function(id) {
        var _ref2;
        return (_ref2 = app.console) != null ? _ref2.outline.select(id) : void 0;
      },
      getFilename: function(url) {
        var name, source, sources;
        sources = app.console.project.get('files');
        source = _.find(sources, function(source) {
          return 0 === url.indexOf(source.url);
        });
        name = basename(url);
        if ((source != null ? source.type : void 0) === 'stylus') {
          name = name.replace(/\.css$/i, '.styl');
        }
        return name;
      },
      setStyleData: function(id, data, nearby, elinfo) {
        var elname, fileitem, fragment, item, lastInheritedElement, name, nearbyEl, numStyles, prop, prop_item, properties, rule, sdata, serialize, sname, subprop, svalue, value, _base, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5, _ref6;
        if (id == null) {
          id = 0;
        }
        if (data == null) {
          data = [];
        }
        if (nearby == null) {
          nearby = [];
        }
        if (elinfo == null) {
          elinfo = null;
        }
        this.$el.toggleClass('has-items', !!data.length);
        this.highlightElement = null;
        $(this.items).empty();
        fragment = document.createDocumentFragment();
        if (elinfo !== null) {
          serialize = [elinfo.index, elinfo.length, elinfo.selector].join('_');
          if ((_ref2 = (_base = this.states)[serialize]) == null) {
            _base[serialize] = {};
          }
          this.currentState = this.states[serialize];
        } else {
          this.currentState = null;
        }
        lastInheritedElement = null;
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          sdata = data[_i];
          item = node('div', {
            "class": 'style-item'
          });
          if (sdata.type === 'inherited' && sdata.element.id + sdata.element.name !== lastInheritedElement) {
            item.appendChild(node('div', {
              "class": 'inherit'
            }, 'Inherited from', elname = node('span', {
              "class": 'element-name'
            }, highlightSelector(sdata.element.name))));
            if (sdata.element.id) {
              $(elname).addClass('is-selectable').bind('click', _.bind(this._onInheritedElementClick, this, sdata.element.id));
            }
            lastInheritedElement = sdata.element.id + sdata.element.name;
          }
          if (sdata.file) {
            fileitem = item.appendChild(node('div', {
              "class": 'file'
            }, this.getFilename(sdata.file)));
            $(fileitem).bind('click', _.bind(this.onFileClick, this, sdata.file, sdata.selector, sdata.index));
          }
          item.appendChild(name = node('div', {
            "class": 'name',
            'data-selector': sdata.selector
          }, sdata.type === 'element' ? 'element.style' : highlightSelector(sdata.selector)));
          $(name).bind('click', this.onItemClick);
          if (sdata.file) {
            $(name).bind('dblclick', _.bind(this.onFileClick, this, sdata.file, sdata.selector, sdata.index));
          }
          if (sdata.media) {
            item.appendChild(node('div', {
              "class": 'media'
            }, node('span', {
              "class": 'label'
            }, '@media'), node('span', {
              "class": 'value'
            }, sdata.media)));
          }
          item.sdata = sdata;
          item.appendChild(properties = node('div', {
            "class": 'properties'
          }));
          numStyles = 0;
          _ref3 = sdata.styles;
          for (name in _ref3) {
            value = _ref3[name];
            numStyles++;
            properties.appendChild(prop = node('div', {
              "class": 'style-prop-container' + (value.disabled ? ' is-disabled' : '')
            }, prop_item = node('div', {
              "class": 'style-prop'
            }, node('div', {
              "class": 'expand-bullet' + (_.size(value.subStyles) ? ' is-visible' : '')
            }), node('span', {
              "class": 'prop-name'
            }, name), this.createValueElement(value.value), value.priority ? node('span', {
              "class": 'priority'
            }, '!' + value.priority) : null)));
            $(prop_item).bind('click', this.onItemClick);
            if ((_ref4 = this.currentState) != null ? (_ref5 = _ref4[sdata.selector + ';' + sdata.file]) != null ? _ref5[name] : void 0 : void 0) {
              $(prop).addClass('is-expanded');
            }
            if (value.subStyles) {
              _ref6 = value.subStyles;
              for (sname in _ref6) {
                svalue = _ref6[sname];
                prop.appendChild(subprop = node('div', {
                  "class": 'style-prop style-prop-sub' + (svalue.disabled ? ' is-disabled' : '')
                }, node('span', {
                  "class": 'prop-name'
                }, sname), this.createValueElement(svalue.value), svalue.priority ? node('span', {
                  "class": 'priority'
                }, '!' + svalue.priority) : null));
                $(subprop).bind('click', this.onItemClick);
              }
            }
            $(prop).bind('dblclick', _.bind(this.onPropDblClick, this, sdata.file, sdata.selector, sdata.index, name));
          }
          if (sdata.type === 'element' && !numStyles) {
            continue;
          }
          fragment.appendChild(item);
        }
        if (nearby.length) {
          nearbyEl = node('div', {
            "class": 'nearby-rules'
          }, node('div', {
            "class": 'head'
          }, 'Nearby rules'));
          for (_j = 0, _len1 = nearby.length; _j < _len1; _j++) {
            rule = nearby[_j];
            nearbyEl.appendChild(item = node('div', {
              "class": 'item'
            }, highlightSelector(rule.selector)));
            $(item).bind('click', _.bind(this.onFileClick, this, rule.file, rule.selector));
          }
          fragment.appendChild(nearbyEl);
        }
        $(this.items).append(fragment);
        if (this.lastId === id) {
          this.focusSelector(this.lastFocus, true);
        } else {
          this.lastFocus = null;
        }
        return this.lastId = id;
      },
      onPropDblClick: function(file, selector, index, property) {
        return this.trigger('open', file, selector, index, property);
      },
      onFileClick: function(file, selector, index) {
        return this.trigger('open', file, selector, index);
      },
      highlight: function(el) {
        var $el, styleItem;
        $el = $(el);
        this.$('.is-highlighted').removeClass('is-highlighted');
        $el.addClass('is-highlighted');
        this.$('.is-focused').removeClass('is-focused');
        $el.closest('.style-item').addClass('is-focused');
        this.highlightElement = el;
        styleItem = $el.closest('.style-item')[0];
        if (styleItem.scrollIntoViewIfNeeded) {
          return styleItem.scrollIntoViewIfNeeded();
        } else {
          if (this.highlightElement.offsetTop < this.el.scrollTop) {
            return this.el.scrollTop = this.highlightElement.offsetTop;
          } else if (this.highlightElement.offsetTop + 20 > this.el.offsetHeight + this.el.scrollTop) {
            return this.el.scrollTop = this.highlightElement.offsetTop + 20 - this.el.offsetHeight;
          }
        }
      },
      open: function() {
        var el, prop, sdata, styleitem;
        if (!this.highlightElement) {
          return;
        }
        el = $(this.highlightElement);
        if (el.hasClass('style-prop-container') || el.hasClass('style-prop-sub')) {
          prop = el.find('.name').text();
          styleitem = el.closest('.style-item')[0];
          sdata = styleitem.sdata;
          if (sdata.file) {
            this.trigger('open', sdata.file, sdata.selector, sdata.index, prop);
          }
        }
        if (el.hasClass('name')) {
          sdata = el.closest('.style-item')[0].sdata;
          if (sdata.file) {
            return this.trigger('open', sdata.file, sdata.selector, sdata.index);
          }
        }
      },
      onItemClick: function(e) {
        var expand, prop, propname, sdata, state, _base, _name, _ref2;
        prop = $(e.currentTarget);
        if (prop.hasClass('name') || prop.hasClass('style-prop')) {
          this.highlight(prop[0]);
        }
        if (e.detail === 2 || $(e.target).hasClass('expand-bullet')) {
          expand = !prop.parent().hasClass('is-expanded');
          prop.parent().toggleClass('is-expanded', expand);
          if (this.currentState) {
            sdata = prop.closest('.style-item')[0].sdata;
            state = (_ref2 = (_base = this.currentState)[_name = sdata.selector + ';' + sdata.file]) != null ? _ref2 : _base[_name] = {};
            propname = prop.find('.prop-name').text();
            if (expand) {
              return state[propname] = 1;
            } else {
              return delete state[propname];
            }
          }
        }
      }
    });
    return module.exports = StyleInfo;
  });

}).call(this);
