gridXSize = 40
gridYSize = 20

grid = []
for row in [0...gridYSize]
	grid[row] = []
	for col in [0...gridXSize]
		if Math.round(Math.random()) is 0
			grid[row][col] = true
		else
			grid[row][col] = false

data = []
for row, y in grid
	for pop, x in row
		tile = {x:x,y:y,pop:pop}
		key = y * gridXSize + x
		data[key] = tile

neighborsCount = (x,y) ->
	count = 0
	if y > 0
		++count if grid[y-1][x+1]
		++count if grid[y-1][x-1]
		++count if grid[y-1][x  ]
	if y < gridYSize - 1
		++count if grid[y+1][x+1]
		++count if grid[y+1][x-1]
		++count if grid[y+1][x  ]
	++count if grid[y  ][x+1]
	++count if grid[y  ][x-1]
	count

calcPop = (x, y) ->
	nbrs = neighborsCount x, y
	if grid[y][x]
		if 1 < nbrs < 4
			p = true
		else
			p = false
	else
		if nbrs is 3
			p = true
		else
			p = false
	p


printObj = (obj) ->
	arr = []
	for d in obj
		arr.push d.pop
	alert arr

viz = d3.select("#viz")
	.append("svg:svg")
	.attr("width", gridXSize * 20 + 1)
	.attr("height", gridYSize * 20 + 1)
	.selectAll("rect")
	.data(data)
	.enter()
	.insert("svg:rect")
	.style("stroke", "gray")
	.style("fill", (d) -> if d.pop then "purple" else "white" )
	.attr("x", (d) -> d.x * 20 + 0.5)
	.attr("y", (d) -> d.y * 20 + 0.5)
	.attr("width",  20)
	.attr("height", 20)

updateData = () ->
	#start = new Date
	updateGrid = []
	for row, y in grid
		updateGrid[y] = []
		for col, x in row
			populated = calcPop x, y
			key = y * gridXSize + x
			data[key].pop = populated
			updateGrid[y][x] = populated
	d3.select("#viz")
		.selectAll("rect")
		.data(data)
		.style("fill", (d) -> if d.pop then "purple" else "white" )
	grid = updateGrid
	#alert new Date - start

setInterval updateData, 100
