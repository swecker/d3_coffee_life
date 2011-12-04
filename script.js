(function() {
  var calcPop, col, data, grid, gridXSize, gridYSize, key, neighborsCount, pop, printObj, row, tile, updateData, viz, x, y, _len, _len2;

  gridXSize = 40;

  gridYSize = 20;

  grid = [];

  for (row = 0; 0 <= gridYSize ? row < gridYSize : row > gridYSize; 0 <= gridYSize ? row++ : row--) {
    grid[row] = [];
    for (col = 0; 0 <= gridXSize ? col < gridXSize : col > gridXSize; 0 <= gridXSize ? col++ : col--) {
      if (Math.round(Math.random() * 2) === 0) {
        grid[row][col] = true;
      } else {
        grid[row][col] = false;
      }
    }
  }

  data = [];

  for (y = 0, _len = grid.length; y < _len; y++) {
    row = grid[y];
    for (x = 0, _len2 = row.length; x < _len2; x++) {
      pop = row[x];
      tile = {
        x: x,
        y: y,
        pop: pop
      };
      key = y * gridXSize + x;
      data[key] = tile;
    }
  }

  neighborsCount = function(x, y) {
    var count;
    count = 0;
    if (y > 0) {
      if (grid[y - 1][x + 1]) ++count;
      if (grid[y - 1][x - 1]) ++count;
      if (grid[y - 1][x]) ++count;
    }
    if (y < gridYSize - 1) {
      if (grid[y + 1][x + 1]) ++count;
      if (grid[y + 1][x - 1]) ++count;
      if (grid[y + 1][x]) ++count;
    }
    if (grid[y][x + 1]) ++count;
    if (grid[y][x - 1]) ++count;
    return count;
  };

  calcPop = function(x, y) {
    var nbrs, p;
    nbrs = neighborsCount(x, y);
    if (grid[y][x]) {
      if ((1 < nbrs && nbrs < 4)) {
        p = true;
      } else {
        p = false;
      }
    } else {
      if (nbrs === 3) {
        p = true;
      } else {
        p = false;
      }
    }
    return p;
  };

  printObj = function(obj) {
    var arr, d, _i, _len3;
    arr = [];
    for (_i = 0, _len3 = obj.length; _i < _len3; _i++) {
      d = obj[_i];
      arr.push(d.pop);
    }
    return alert(arr);
  };

  viz = d3.select("#viz").append("svg:svg").attr("width", gridXSize * 20 + 1).attr("height", gridYSize * 20 + 1).selectAll("rect").data(data).enter().insert("svg:rect").style("stroke", "gray").style("fill", function(d) {
    if (d.pop) {
      return "purple";
    } else {
      return "white";
    }
  }).attr("x", function(d) {
    return d.x * 20 + 0.5;
  }).attr("y", function(d) {
    return d.y * 20 + 0.5;
  }).attr("width", 20).attr("height", 20);

  updateData = function() {
    var col, populated, row, updateGrid, x, y, _len3, _len4;
    updateGrid = [];
    for (y = 0, _len3 = grid.length; y < _len3; y++) {
      row = grid[y];
      updateGrid[y] = [];
      for (x = 0, _len4 = row.length; x < _len4; x++) {
        col = row[x];
        populated = calcPop(x, y);
        key = y * gridXSize + x;
        data[key].pop = populated;
        updateGrid[y][x] = populated;
      }
    }
    d3.select("#viz").selectAll("rect").data(data).style("fill", function(d) {
      if (d.pop) {
        return "purple";
      } else {
        return "white";
      }
    });
    return grid = updateGrid;
  };

  setInterval(updateData, 100);

}).call(this);
