gridXSize = 40
gridYSize = 31
lightSources = {}

grid = []
for row in [0...gridYSize]
	grid[row] = []
	for col in [0...gridXSize]
		if Math.round(Math.random()*3) is 0
			grid[row][col] =
				x: col
				y: row
				type: "wall"
				lighting: {}
		else
			grid[row][col] =
				x: col
				y: row
				type: "floor"
				lighting: {}
removeLightSource = (id) ->
	for row in grid
		for tile in row
			tile.lighting[id] = null

# Multipliers for transforming coordinates into other octants
mult = [
	[1,  0,  0, -1, -1,  0,  0,  1],
	[0,  1, -1,  0,  0, -1,  1,  0],
	[0,  1,  1,  0,  0, -1, -1,  0],
	[1,  0,  0,  1, -1,  0,  0, -1],
] 

is_blocked = (x, y) ->
	if x <= 0 or x >= gridXSize - 1 or y <= 0 or y >= gridYSize - 1
		true
	else if grid[y][x].type is "wall"
		true
	else
		false

light = (x, y, ox, oy, radius,  id) ->
	dist = Math.sqrt((x - ox) * (x - ox) + (y - oy) * (y - oy))
	if dist > radius
		return
	else
		lighting = (radius - dist)/radius * 1.5
		grid[y][x].lighting[id] = lighting

# Determines which co-ordinates on a 2D grid are visible
# from a particular co-ordinate.
# start_x, start_y: center of view
# radius: how far field of view extends
do_fov = (start_x, start_y, radius, id) ->
	if lightSources[id]
		removeLightSource(id)
	lightSources[id] = true
	light start_x, start_y, start_x, start_y, radius, id
	for oct in [0..7]
		cast_light( start_x, start_y, 1, 1.0, 0.0, radius,
			mult[0][oct], mult[1][oct],
			mult[2][oct], mult[3][oct], id)

cast_light = (cx, cy, row, light_start, light_end, radius, xx, xy, yx, yy, id) ->
	return if light_start < light_end
	radius_sq = radius * radius
	for j in [row..radius] # .. is inclusive
		dx = -j - 1
		dy = -j
		blocked = false
		while dx <= 0
			dx += 1
			# Translate the dx, dy co-ordinates into map co-ordinates
			mx = cx + dx * xx + dy * xy
			my = cy + dx * yx + dy * yy
			alert "#{cy} + #{dx} * #{yx} + #{dy} * #{yy}" if isNaN my
			# l_slope and r_slope store the slopes of the left and right
			# extremities of the square we're considering:
			l_slope = (dx-0.5)/(dy+0.5)
			r_slope = (dx+0.5)/(dy-0.5)
			if light_start < r_slope
				continue
			else if light_end > l_slope
				break
			else
				# Our light beam is touching this square; light it
				light(mx, my, cx, cy, radius, id) if (dx*dx + dy*dy) < radius_sq
				if blocked
					# We've scanning a row of blocked squares
					if is_blocked(mx, my)
						new_start = r_slope
						continue
					else
						blocked = false
						light_start = new_start
				else
					if is_blocked(mx, my) and j < radius
						# This is a blocking square, start a child scan
						blocked = true
						cast_light(cx, cy, j+1, light_start, l_slope,
						radius, xx, xy, yx, yy, id)
						new_start = r_slope
		break if blocked

#do_fov(10, 10, 10, 8)
data = []
refreshDataArray = () -> 
	index = 0
	for row in grid
		for tile in row
			data[index] = tile
			++index

refreshDataArray() 

viz_bg = d3.select("#viz_bg")
	.append("svg:svg")
	.attr("width", gridXSize * 20 + 1)
	.attr("height", gridYSize * 20 + 1)
	.selectAll("rect")
	.data(data)
	.enter()
	.insert("svg:rect")
	.style("stroke", "gray")
	.style("fill", (d) ->
		if d.type is "wall" 
			"red"
		else 
			"white" )
	.attr("x", (d) -> d.x * 20 + 0.5)
	.attr("y", (d) -> d.y * 20 + 0.5)
	.attr("width",  20)
	.attr("height", 20)
lSCount = 2
viz = d3.select("#viz")
	.append("svg:svg")
	.attr("width", gridXSize * 20 + 1)
	.attr("height", gridYSize * 20 + 1)
	.selectAll("rect")
	.data(data)
	.enter()
	.insert("svg:rect")
	.style("stroke", "gray")
	.style("fill", "black" )
	.style("opacity", (d) ->
		lighting = 0
		for val of d.lighting
			lighting += d.lighting[val]
		#lighting = 1 if lighting > 1
		1 - lighting )
	.attr("x", (d) -> d.x * 20 + 0.5)
	.attr("y", (d) -> d.y * 20 + 0.5)
	.attr("width",  20)
	.attr("height", 20)
	.on("click", (d) ->
		do_fov(d.x, d.y, Math.round(Math.random()*5+3), lSCount)
		++lSCount
		updateData())
	.on("mouseover", (d) ->
		do_fov(d.x, d.y, 10, 1)
		updateData())

updateData = () ->
	#start = new Date
	refreshDataArray()
	d3.select("#viz")
		.selectAll("rect")
		.data(data)
		.style("opacity", (d) ->
			lighting = 0
			for val of d.lighting
				lighting += d.lighting[val]
			lighting = 1 if lighting > 1
			1 - lighting )
	#alert new Date - start


