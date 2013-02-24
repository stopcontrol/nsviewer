// Generated by CoffeeScript 1.4.0
(function() {
  var ColorMap, Crosshairs, DataField, DataPanel, Image, Layer, LayerList, SettingsPanel, Slider, Threshold, Transform, View, Viewer, _Viewer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Viewer || (window.Viewer = {});

  window.Viewer = Viewer = (function() {

    function Viewer() {}

    Viewer._instance = void 0;

    Viewer.get = function(layerListElement, layerSettingClass) {
      var _ref;
      return (_ref = this._instance) != null ? _ref : this._instance = new _Viewer(layerListElement, layerSettingClass);
    };

    return Viewer;

  })();

  _Viewer = (function() {

    function _Viewer(layerListId, layerSettingClass) {
      this.coords = Transform.atlasToImage([0, 0, 0]);
      this.cxyz = Transform.atlasToViewer([0.0, 0.0, 0.0]);
      this.views = [];
      this.sliders = {};
      this.crosshairs = new Crosshairs();
      this.dataPanel = new DataPanel();
      this.layerList = new LayerList();
      this.settingsPanel = new SettingsPanel(this, layerListId, layerSettingClass);
    }

    _Viewer.prototype.paint = function() {
      var al, l, v, _i, _j, _len, _len1, _ref, _ref1;
      if (this.layerList.activeLayer) {
        al = this.layerList.activeLayer;
        this.updateDataDisplay();
      }
      _ref = this.views;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.clear();
        _ref1 = this.layerList.layers.slice(0).reverse();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          l = _ref1[_j];
          if (l.visible) {
            v.paint(l);
          }
        }
        v.crosshairs(this.crosshairs);
      }
    };

    _Viewer.prototype.clear = function() {
      var v, _i, _len, _ref, _results;
      _ref = this.views;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(v.clear());
      }
      return _results;
    };

    _Viewer.prototype.addView = function(element, dim, index) {
      return this.views.push(new View(element, dim, index));
    };

    _Viewer.prototype.addSlider = function(name, element, orientation, range, min, max, value, step) {
      return this.settingsPanel.addSlider(name, element, orientation, range, min, max, value, step);
    };

    _Viewer.prototype.addDataField = function(name, element) {
      return this.dataPanel.addDataField(name, element);
    };

    _Viewer.prototype.addColorSelect = function(element) {
      return this.settingsPanel.addColorSelect(element);
    };

    _Viewer.prototype.loadImage = function(data, name, colorPalette, activate) {
      if (colorPalette == null) {
        colorPalette = 'hot_and_cold';
      }
      if (activate == null) {
        activate = true;
      }
      this.layerList.addLayer(new Layer(name, new Image(data), colorPalette), activate);
      this.settingsPanel.updateLayerList(this.layerList.getLayerNames(), this.layerList.getActiveIndex());
      this.settingsPanel.updateLayerVisibility(this.layerList.getLayerVisibilities());
      this.settingsPanel.updateLayerSelection(this.layerList.getActiveIndex());
      this.settingsPanel.updateComponents(this.layerList.activeLayer.getSettings());
      return this.paint();
    };

    _Viewer.prototype.loadImageFromJSON = function(dataSource, name, colorPalette, activate) {
      var _this = this;
      if (colorPalette == null) {
        colorPalette = 'hot_and_cold';
      }
      if (activate == null) {
        activate = true;
      }
      return $.getJSON(dataSource, function(data) {
        return _this.loadImage(data, name, colorPalette, activate);
      });
    };

    _Viewer.prototype.selectLayer = function(index) {
      this.layerList.activateLayer(index);
      this.settingsPanel.updateLayerSelection(this.layerList.getActiveIndex());
      return this.settingsPanel.updateComponents(this.layerList.activeLayer.getSettings());
    };

    _Viewer.prototype.toggleLayer = function(index) {
      this.layerList.layers[index].toggle();
      this.settingsPanel.updateLayerVisibility(this.layerList.getLayerVisibilities());
      return this.paint();
    };

    _Viewer.prototype.sortLayers = function(layers) {
      this.layerList.sortLayers(layers);
      this.settingsPanel.updateLayerVisibility(this.layerList.getLayerVisibilities());
      return this.paint();
    };

    _Viewer.prototype.updateSettings = function(settings) {
      this.layerList.updateActiveLayer(settings);
      return this.paint();
    };

    _Viewer.prototype.updateDataDisplay = function() {
      var activeLayer, currentCoords, currentValue, data, x, y, z, _ref;
      activeLayer = this.layerList.activeLayer;
      _ref = this.coords, x = _ref[0], y = _ref[1], z = _ref[2];
      currentValue = activeLayer.image.data[z][y][x];
      currentCoords = Transform.imageToAtlas(viewer.coords.slice(0)).join(', ');
      data = {
        voxelValue: currentValue,
        currentCoords: currentCoords
      };
      return this.dataPanel.update(data);
    };

    _Viewer.prototype.deleteView = function(index) {
      return this.views.splice(index, 1);
    };

    _Viewer.prototype.jQueryInit = function() {
      return this.settingsPanel.jQueryInit();
    };

    return _Viewer;

  })();

  Image = (function() {

    function Image(data) {
      var vec, _ref;
      _ref = [data.max, data.min, data.dims[0], data.dims[1], data.dims[2]], this.max = _ref[0], this.min = _ref[1], this.x = _ref[2], this.y = _ref[3], this.z = _ref[4];
      vec = Transform.jsonToVector(data);
      this.data = Transform.vectorToVolume(vec, [this.x, this.y, this.z]);
    }

    Image.prototype.resample = function(newx, newy, newz) {};

    Image.prototype.slice = function(dim, index) {
      var i, j, slice, _i, _j, _k, _ref, _ref1, _ref2;
      switch (dim) {
        case 0:
          slice = [];
          for (i = _i = 0, _ref = this.x; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            slice[i] = [];
            for (j = _j = 0, _ref1 = this.y; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
              slice[i][j] = this.data[i][j][index];
            }
          }
          break;
        case 1:
          slice = [];
          for (i = _k = 0, _ref2 = this.x; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
            slice[i] = this.data[i][index];
          }
          slice;

          break;
        case 2:
          slice = this.data[index];
      }
      return slice;
    };

    Image.prototype.dims = function() {
      return [this.x, this.y, this.z];
    };

    return Image;

  })();

  Layer = (function() {

    function Layer(name, image, palette) {
      this.name = name;
      this.image = image;
      if (palette == null) {
        palette = 'hot_and_cold';
      }
      this.visible = true;
      this.threshold = this.setThreshold(0, 0);
      this.colorMap = this.setColorMap(palette);
      this.opacity = 1.0;
    }

    Layer.prototype.hide = function() {
      return this.visible = false;
    };

    Layer.prototype.show = function() {
      return this.visible = true;
    };

    Layer.prototype.toggle = function() {
      return this.visible = !this.visible;
    };

    Layer.prototype.slice = function(view) {
      var data;
      data = this.image.slice(view.dim, viewer.coords[view.dim]);
      data = this.threshold.mask(data);
      return data;
    };

    Layer.prototype.setColorMap = function(palette, steps) {
      if (palette == null) {
        palette = null;
      }
      if (steps == null) {
        steps = null;
      }
      this.palette = palette;
      return this.colorMap = new ColorMap(this.image.min, this.image.max, palette, steps);
    };

    Layer.prototype.setThreshold = function(negThresh, posThresh) {
      if (negThresh == null) {
        negThresh = 0;
      }
      if (posThresh == null) {
        posThresh = 0;
      }
      return this.threshold = new Threshold(negThresh, posThresh);
    };

    Layer.prototype.update = function(settings) {
      var k, nt, pt, v;
      nt = 0;
      pt = 0;
      for (k in settings) {
        v = settings[k];
        switch (k) {
          case 'colorPalette':
            this.setColorMap(v);
            break;
          case 'opacity':
            this.opacity = v;
            break;
          case 'pos-threshold':
            pt = v * this.image.max;
            break;
          case 'neg-threshold':
            nt = v * this.image.min;
        }
      }
      return this.setThreshold(nt, pt);
    };

    Layer.prototype.getSettings = function() {
      var nt, pt, settings;
      nt = this.threshold.negThresh / this.image.min;
      pt = this.threshold.posThresh / this.image.max;
      settings = {
        colorPalette: this.palette,
        opacity: this.opacity,
        'pos-threshold': pt,
        'neg-threshold': nt
      };
      return settings;
    };

    return Layer;

  })();

  LayerList = (function() {

    function LayerList() {
      this.layers = [];
      this.activeLayer = null;
    }

    LayerList.prototype.addLayer = function(layer, activate) {
      if (activate == null) {
        activate = true;
      }
      this.layers.push(layer);
      if (activate) {
        return this.activateLayer(this.layers.length - 1);
      }
    };

    LayerList.prototype.deleteLayer = function(index) {
      return this.layers.splice(index, 1);
    };

    LayerList.prototype.activateLayer = function(index) {
      return this.activeLayer = this.layers[index];
    };

    LayerList.prototype.updateActiveLayer = function(settings) {
      return this.activeLayer.update(settings);
    };

    LayerList.prototype.getLayerNames = function() {
      var l;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          _results.push(l.name);
        }
        return _results;
      }).call(this);
    };

    LayerList.prototype.getLayerVisibilities = function() {
      var l;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          _results.push(l.visible);
        }
        return _results;
      }).call(this);
    };

    LayerList.prototype.getActiveIndex = function() {
      return this.layers.indexOf(this.activeLayer);
    };

    LayerList.prototype.sortLayers = function(newOrder) {
      var i, l, newLayers, _i, _len, _ref;
      newLayers = [];
      _ref = this.layers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        i = newOrder.indexOf(l.name);
        newLayers[i] = l;
      }
      return this.layers = newLayers;
    };

    return LayerList;

  })();

  Threshold = (function() {

    function Threshold(negThresh, posThresh) {
      this.negThresh = negThresh;
      this.posThresh = posThresh;
    }

    Threshold.prototype.mask = function(data) {
      var i, res, _i, _ref,
        _this = this;
      if (this.posThresh === 0 && this.negThresh === 0) {
        return data;
      }
      res = [];
      for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        res[i] = data[i].map(function(v) {
          if ((_this.negThresh < v && v < _this.posThresh)) {
            return 0;
          } else {
            return v;
          }
        });
      }
      return res;
    };

    return Threshold;

  })();

  Transform = {
    jsonToVector: function(data) {
      var curr_inds, i, j, v, _i, _j, _k, _ref, _ref1, _ref2;
      v = new Array(data.dims[0] * data.dims[1] * data.dims[2]);
      for (i = _i = 0, _ref = v.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        v[i] = 0;
      }
      for (i = _j = 0, _ref1 = data.values.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        curr_inds = data.indices[i];
        for (j = _k = 0, _ref2 = curr_inds.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          v[curr_inds[j] - 1] = data.values[i];
        }
      }
      return v;
    },
    vectorToVolume: function(vec, dims) {
      var i, j, k, sliceSize, vol, x, y, z, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
      vol = [];
      for (i = _i = 0, _ref = dims[0]; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        vol[i] = [];
        for (j = _j = 0, _ref1 = dims[1]; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          vol[i][j] = [];
          for (k = _k = 0, _ref2 = dims[2]; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; k = 0 <= _ref2 ? ++_k : --_k) {
            vol[i][j][k] = 0;
            sliceSize = dims[1] * dims[2];
          }
        }
      }
      for (i = _l = 0, _ref3 = vec.length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; i = 0 <= _ref3 ? ++_l : --_l) {
        if (typeof vec[i] === undefined) {
          continue;
        }
        x = Math.floor(i / sliceSize);
        y = Math.floor((i - (x * sliceSize)) / dims[2]);
        z = i - (x * sliceSize) - (y * dims[2]);
        vol[x][y][z] = vec[i];
      }
      return vol;
    },
    transformCoordinates: function(coords, matrix, round) {
      var m, res, v;
      if (round == null) {
        round = true;
      }
      m = $M(matrix);
      coords.push(1);
      v = $V(coords);
      res = [];
      m.x(v).each(function(e) {
        if (round) {
          e = Math.floor(e);
        }
        return res.push(e);
      });
      return res;
    },
    viewerToAtlas: function(coords) {
      var matrix;
      matrix = [[180, 0, 0, -90], [0, -218, 0, 90], [0, 0, -180, 108]];
      return this.transformCoordinates(coords, matrix);
    },
    atlasToViewer: function(coords) {
      var matrix;
      matrix = [[1.0 / 180, 0, 0, 0.5], [0, -1.0 / 218, 0, 90.0 / 218], [0, 0, -1.0 / 180, 108.0 / 180]];
      return this.transformCoordinates(coords, matrix, false);
    },
    atlasToImage: function(coords) {
      var matrix;
      matrix = [[-0.5, 0, 0, 45], [0, 0.5, 0, 63], [0, 0, 0.5, 36]];
      return this.transformCoordinates(coords, matrix);
    },
    imageToAtlas: function(coords) {
      var matrix;
      matrix = [[-2, 0, 0, 90], [0, 2, 0, -126], [0, 0, 2, -72]];
      return this.transformCoordinates(coords, matrix);
    }
  };

  SettingsPanel = (function() {

    function SettingsPanel(viewer, layerListId, layerSettingClass) {
      var _this = this;
      this.viewer = viewer;
      this.layerListId = layerListId;
      this.layerSettingClass = layerSettingClass;
      this.sliders = {};
      $(this.layerListId).sortable({
        update: function() {
          var layers;
          layers = ($('.layer_list_item').map(function() {
            return $(this).text();
          })).toArray();
          return _this.viewer.sortLayers(layers);
        }
      });
      $(this.layerSettingClass).change(function(e) {
        return _this.settingsChanged();
      });
    }

    SettingsPanel.prototype.addSlider = function(name, element, orientation, range, min, max, value, step) {
      return this.sliders[name] = new Slider(this, name, element, orientation, range, min, max, value, step);
    };

    SettingsPanel.prototype.addColorSelect = function(element) {
      var p, _results;
      this.colorSelect = element;
      $(element).empty();
      _results = [];
      for (p in ColorMap.PALETTES) {
        _results.push($(element).append($('<option></option>').text(p).val(p)));
      }
      return _results;
    };

    SettingsPanel.prototype.settingsChanged = function() {
      var name, settings, slider, _ref;
      settings = {};
      _ref = this.sliders;
      for (name in _ref) {
        slider = _ref[name];
        settings[name] = $(slider.element).slider('option', 'value');
      }
      if (this.colorSelect != null) {
        settings['colorPalette'] = $(this.colorSelect).val();
      }
      return this.viewer.updateSettings(settings);
    };

    SettingsPanel.prototype.updateComponents = function(settings) {
      var k, v, _results;
      if ('colorPalette' in settings) {
        $(this.colorSelect).val(settings['colorPalette']);
      }
      _results = [];
      for (k in settings) {
        v = settings[k];
        if (k in this.sliders) {
          _results.push($(this.sliders[k].element).slider('option', 'value', v));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SettingsPanel.prototype.updateLayerList = function(layers, selectedIndex) {
      var i, l, _i, _ref,
        _this = this;
      $(this.layerListId + ',#layer_visible_list').empty();
      for (i = _i = 0, _ref = layers.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        l = layers[i];
        $(this.layerListId).append($('<li class="layer_list_item"></li>').text(l));
        $('#layer_visible_list').append($("<i class='icon-eye-open toggle_img' id=" + i + "></i>").click(function(e) {
          return _this.toggleLayer($(e.target).attr('id'));
        }));
      }
      $('.layer_list_item').click(function(e) {
        return _this.viewer.selectLayer($('.layer_list_item').index(e.target));
      });
      return $(this.layerListId).val(selectedIndex);
    };

    SettingsPanel.prototype.updateLayerVisibility = function(visible) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = visible.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (visible[i]) {
          _results.push($('.toggle_img').eq(i).removeClass('icon-eye-close').addClass('icon-eye-open'));
        } else {
          _results.push($('.toggle_img').eq(i).removeClass('icon-eye-open').addClass('icon-eye-close'));
        }
      }
      return _results;
    };

    SettingsPanel.prototype.updateLayerSelection = function(id) {
      $('.layer_list_item').eq(id).addClass('selected');
      return $('.layer_list_item').not(":eq(" + id + ")").removeClass('selected');
    };

    SettingsPanel.prototype.toggleLayer = function(id) {
      return this.viewer.toggleLayer(id);
    };

    return SettingsPanel;

  })();

  DataPanel = (function() {

    function DataPanel() {
      this.fields = {};
    }

    DataPanel.prototype.addDataField = function(name, element) {
      return this.fields[name] = new DataField(this, name, element);
    };

    DataPanel.prototype.update = function(data) {
      var k, v, _results;
      _results = [];
      for (k in data) {
        v = data[k];
        if (k in this.fields) {
          if (k === 'currentCoords') {
            v = "[" + v + "]";
          }
          _results.push($(this.fields[k].element).text(v));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return DataPanel;

  })();

  View = (function() {

    function View(element, dim) {
      this.element = element;
      this.dim = dim;
      this.click = __bind(this.click, this);

      this.viewer = $(element).find('canvas');
      this.width = this.viewer.width();
      this.height = this.viewer.height();
      this.context = this.viewer[0].getContext("2d");
      this._jQueryInit();
    }

    View.prototype.clear = function() {
      this.context.fillStyle = 'black';
      return this.context.fillRect(0, 0, this.width, this.height);
    };

    View.prototype.paint = function(layer) {
      var col, cols, data, dims, i, img, j, xCell, xp, yCell, yp, _i, _j, _ref, _ref1;
      data = layer.slice(this);
      cols = layer.colorMap.map(data);
      img = layer.image;
      dims = [[img.y, img.z], [img.x, img.z], [img.x, img.y]];
      xCell = this.width / dims[this.dim][0];
      yCell = this.height / dims[this.dim][1];
      this.context.globalAlpha = layer.opacity;
      for (i = _i = 0, _ref = dims[this.dim][1]; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        for (j = _j = 0, _ref1 = dims[this.dim][0]; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          if (typeof data[i][j] === undefined | data[i][j] === 0) {
            continue;
          }
          xp = this.width - (j + 1) * xCell - xCell;
          yp = this.height - i * yCell;
          col = cols[i][j];
          this.context.fillStyle = col;
          this.context.fillRect(xp + xCell / 2, yp, xCell + 1, yCell + 1);
        }
      }
      return this.context.globalAlpha = 1.0;
    };

    View.prototype.crosshairs = function(ch) {
      var xPos, yPos;
      if (ch.visible) {
        this.context.fillStyle = ch.color;
        xPos = viewer.cxyz[[1, 0, 0][this.dim]] * this.width;
        yPos = viewer.cxyz[[2, 2, 1][this.dim]] * this.height;
        this.context.fillRect(0, yPos - ch.width / 2, this.width, ch.width);
        return this.context.fillRect(xPos - ch.width / 2, 0, ch.width, this.height);
      }
    };

    View.prototype.click = function(e) {
      var coords, cx, cy, offset, xyz;
      xyz = viewer.coords;
      offset = $(e.target).offset();
      cx = e.pageX - offset.left;
      cy = e.pageY - offset.top;
      cx /= this.width;
      cy /= this.height;
      viewer.cxyz = (function() {
        switch (this.dim) {
          case 2:
            return [cx, cy, viewer.cxyz[2]];
          case 1:
            return [cx, viewer.cxyz[1], cy];
          case 0:
            return [viewer.cxyz[0], cx, cy];
        }
      }).call(this);
      coords = viewer.cxyz;
      viewer.coords = Transform.atlasToImage(Transform.viewerToAtlas(coords));
      return viewer.paint();
    };

    View.prototype._jQueryInit = function() {
      return $(this.element).click(this.click);
    };

    return View;

  })();

  Crosshairs = (function() {

    function Crosshairs(visible, color, width) {
      this.visible = visible != null ? visible : true;
      this.color = color != null ? color : 'lime';
      this.width = width != null ? width : 1;
    }

    return Crosshairs;

  })();

  ColorMap = (function() {

    ColorMap.PALETTES = {
      'hot and cold': ['aqua', '#0099FF', 'blue', 'white', 'red', 'orange', 'yellow'],
      gray: ['#000000', '#303030', 'gray', 'silver', 'white'],
      'bright lights': ['blue', 'red', 'yellow', 'green', 'purple'],
      green: ['#006400', '#98FB98', '#ADFF2F']
    };

    function ColorMap(min, max, palette, steps) {
      this.min = min;
      this.max = max;
      if (palette == null) {
        palette = 'hot_and_cold';
      }
      this.steps = steps != null ? steps : 40;
      this.range = max - min;
      this.colors = this.setColors(ColorMap.PALETTES[palette]);
    }

    ColorMap.prototype.map = function(data) {
      var i, res, _i, _ref,
        _this = this;
      res = [];
      for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        res[i] = data[i].map(function(v) {
          return _this.colors[Math.floor(((v - _this.min) / _this.range) * _this.steps)];
        });
      }
      return res;
    };

    ColorMap.prototype.setColors = function(colors) {
      var i, rainbow, _i, _ref;
      rainbow = new Rainbow();
      rainbow.setNumberRange(1, this.steps);
      rainbow.setSpectrum.apply(null, colors);
      colors = [];
      for (i = _i = 1, _ref = this.steps; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        colors.push(rainbow.colourAt(i));
      }
      return colors.map(function(c) {
        return "#" + c;
      });
    };

    return ColorMap;

  })();

  Slider = (function() {

    function Slider(panel, name, element, orientation, range, min, max, value, step) {
      this.panel = panel;
      this.name = name;
      this.element = element;
      this.orientation = orientation;
      this.range = range;
      this.min = min;
      this.max = max;
      this.value = value;
      this.step = step;
      this.change = __bind(this.change, this);

      this._jQueryInit();
    }

    Slider.prototype.change = function(e) {
      return this.panel.settingsChanged();
    };

    Slider.prototype._jQueryInit = function() {
      return $(this.element).slider({
        orientation: this.orientation,
        range: this.range,
        min: this.min,
        max: this.max,
        value: this.value,
        step: this.step,
        slide: this.change,
        change: this.change
      });
    };

    return Slider;

  })();

  DataField = (function() {

    function DataField(panel, name, element) {
      this.panel = panel;
      this.name = name;
      this.element = element;
    }

    return DataField;

  })();

}).call(this);
