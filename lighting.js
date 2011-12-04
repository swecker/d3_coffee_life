(function() {
  var cast_light, col, data, do_fov, grid, gridXSize, gridYSize, is_blocked, lSCount, light, lightSources, mult, refreshDataArray, removeLightSource, row, updateData, viz, viz_bg;

  gridXSize = 40;

  gridYSize = 31;

  lightSources = {};

  grid = [];

  for (row = 0; 0 <= gridYSize ? row < gridYSize : row > gridYSize; 0 <= gridYSize ? row++ : row--) {
    grid[row] = [];
    for (col = 0; 0 <= gridXSize ? col < gridXSize : col > gridXSize; 0 <= gridXSize ? col++ : col--) {
      if (Math.round(Math.random() * 3) === 0) {
        grid[row][col] = {
          x: col,
          y: row,
          type: "wall",
          lighting: {}
        };
      } else {
        grid[row][col] = {
          x: col,
          y: row,
          type: "floor",
          lighting: {}
        };
      }
    }
  }

  removeLightSource = function(id) {
    var row, tile, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = grid.length; _i < _len; _i++) {
      row = grid[_i];
      _results.push((function() {
        var _j, _len2, _results2;
        _results2 = [];
        for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
          tile = row[_j];
          _results2.push(tile.lighting[id] = null);
        }
        return _results2;
      })());
    }
    return _results;
  };

  mult = [[1, 0, 0, -1, -1, 0, 0, 1], [0, 1, -1, 0, 0, -1, 1, 0], [0, 1, 1, 0, 0, -1, -1, 0], [1, 0, 0, 1, -1, 0, 0, -1]];

  is_blocked = function(x, y) {
    if (x <= 0 || x >= gridXSize - 1 || y <= 0 || y >= gridYSize - 1) {
      return true;
    } else if (grid[y][x].type === "wall") {
      return true;
    } else {
      return false;
    }
  };

  light = function(x, y, ox, oy, radius, id) {
    var dist, lighting;
    dist = Math.sqrt((x - ox) * (x - ox) + (y - oy) * (y - oy));
    if (dist > radius) {} else {
      lighting = (radius - dist) / radius * 1.5;
      return grid[y][x].lighting[id] = lighting;
    }
  };

  do_fov = function(start_x, start_y, radius, id) {
    var oct, _results;
    if (lightSources[id]) removeLightSource(id);
    lightSources[id] = true;
    light(start_x, start_y, start_x, start_y, radius, id);
    _results = [];
    for (oct = 0; oct <= 7; oct++) {
      _results.push(cast_light(start_x, start_y, 1, 1.0, 0.0, radius, mult[0][oct], mult[1][oct], mult[2][oct], mult[3][oct], id));
    }
    return _results;
  };

  cast_light = function(cx, cy, row, light_start, light_end, radius, xx, xy, yx, yy, id) {
    var blocked, dx, dy, j, l_slope, mx, my, new_start, r_slope, radius_sq, _results;
    if (light_start < light_end) return;
    radius_sq = radius * radius;
    _results = [];
    for (j = row; row <= radius ? j <= radius : j >= radius; row <= radius ? j++ : j--) {
      dx = -j - 1;
      dy = -j;
      blocked = false;
      while (dx <= 0) {
        dx += 1;
        mx = cx + dx * xx + dy * xy;
        my = cy + dx * yx + dy * yy;
        if (isNaN(my)) {
          alert("" + cy + " + " + dx + " * " + yx + " + " + dy + " * " + yy);
        }
        l_slope = (dx - 0.5) / (dy + 0.5);
        r_slope = (dx + 0.5) / (dy - 0.5);
        if (light_start < r_slope) {
          continue;
        } else if (light_end > l_slope) {
          break;
        } else {
          if ((dx * dx + dy * dy) < radius_sq) light(mx, my, cx, cy, radius, id);
          if (blocked) {
            if (is_blocked(mx, my)) {
              new_start = r_slope;
              continue;
            } else {
              blocked = false;
              light_start = new_start;
            }
          } else {
            if (is_blocked(mx, my) && j < radius) {
              blocked = true;
              cast_light(cx, cy, j + 1, light_start, l_slope, radius, xx, xy, yx, yy, id);
              new_start = r_slope;
            }
          }
        }
      }
      if (blocked) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  data = [];

  refreshDataArray = function() {
    var index, row, tile, _i, _len, _results;
    index = 0;
    _results = [];
    for (_i = 0, _len = grid.length; _i < _len; _i++) {
      row = grid[_i];
      _results.push((function() {
        var _j, _len2, _results2;
        _results2 = [];
        for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
          tile = row[_j];
          data[index] = tile;
          _results2.push(++index);
        }
        return _results2;
      })());
    }
    return _results;
  };

  refreshDataArray();

  viz_bg = d3.select("#viz_bg").append("svg:svg").attr("width", gridXSize * 20 + 1).attr("height", gridYSize * 20 + 1).selectAll("rect").data(data).enter().insert("svg:rect").style("stroke", "gray").style("fill", function(d) {
    if (d.type === "wall") {
      return "red";
    } else {
      return "white";
    }
  }).attr("x", function(d) {
    return d.x * 20 + 0.5;
  }).attr("y", function(d) {
    return d.y * 20 + 0.5;
  }).attr("width", 20).attr("height", 20);

  lSCount = 2;

  viz = d3.select("#viz").append("svg:svg").attr("width", gridXSize * 20 + 1).attr("height", gridYSize * 20 + 1).selectAll("rect").data(data).enter().insert("svg:rect").style("stroke", "gray").style("fill", "black").style("opacity", function(d) {
    var lighting, val;
    lighting = 0;
    for (val in d.lighting) {
      lighting += d.lighting[val];
    }
    return 1 - lighting;
  }).attr("x", function(d) {
    return d.x * 20 + 0.5;
  }).attr("y", function(d) {
    return d.y * 20 + 0.5;
  }).attr("width", 20).attr("height", 20).on("click", function(d) {
    do_fov(d.x, d.y, Math.round(Math.random() * 5 + 3), lSCount);
    ++lSCount;
    return updateData();
  }).on("mouseover", function(d) {
    do_fov(d.x, d.y, 10, 1);
    return updateData();
  });

  updateData = function() {
    refreshDataArray();
    return d3.select("#viz").selectAll("rect").data(data).style("opacity", function(d) {
      var lighting, val;
      lighting = 0;
      for (val in d.lighting) {
        lighting += d.lighting[val];
      }
      if (lighting > 1) lighting = 1;
      return 1 - lighting;
    });
  };

}).call(this);
