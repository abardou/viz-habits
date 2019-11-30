import * as d3 from 'd3';

// Class for ring
export default class Ring {
	/* Constructor for Ring
	 * svg: the svg to draw in
	 * tooltip: the tooltip to manipulate
	 * id: the id of the ring (used in the svg)
	 * cx: the absciss center of the ring
	 * cy: the ordinate center of the ring
	 * outrad: the outer radius of the ring
	 * inrad: the inner radius of the ring
	 * selcol: the select color of a ring segment
	 * unselcol: the unselect color of a ring segment
	 * data: the data displayed in the tooltip
	 */
	constructor(svg, tooltip, id, cx, cy, outrad, inrad, selcol, unselcol, data) {
		this.svg = svg;
		this.tooltip = tooltip;
		this.id = id;
		this.cx = cx;
		this.cy = cy;
		this.outrad = outrad;
		this.inrad = inrad;
		this.selcol = selcol;
		this.unselcol = unselcol;
		this.data = data;
		
		let l = data.length;
		this.s_size = 1 / (l*Math.PI); // Space size
		this.r_length = 2*Math.PI / l; // Size of arc + space
		this.a_size = this.r_length - this.s_size; // Arc size
		this.selected = new Array(l).fill(true); // Selected segments
	}
	
	/* Return the color of the ith segment in the ring
	 * i : data index, used to resolve color
	 */
	color(i) {
		return this.selected[i] ? this.selcol : this.unselcol;
	}
	
	/* Called when the mouse moves on a ring segment
	 * d: data value, included in the tooltip
	 */
	mouse_move(d, pathObject) {
		const mousePosition = d3.mouse(pathObject);
		this.tooltip.classed('hidden', false)
			.attr('style', `left: ${(mousePosition[0] + 15 + this.cx)}px; top: ${(mousePosition[1] - 35 + this.cy)}px`)
			.html(d);
	}
	
	/* Called when the mouse is over a ring segment
	 * i: data index, used to resolve color
	 */
	mouse_over(i, pathObject) {
		var col = this.selected[i] ? this.unselcol : this.selcol;
		d3.select(pathObject).style('fill', col);
	}
	
	/* Called when the mouse is out of a ring segment
	 * i: data index, used to resolve color
	 */
	mouse_out(i, pathObject) {
		var col = this.color(i);
		d3.select(pathObject).transition().duration(400).style('fill', col);
		this.tooltip.classed('hidden', true);
	}
	
	/* Called when a ring segment is clicked
	 * i: data index, used to update intern state
	 */
	on_click(i, pathObject) {
		this.selected[i] = !this.selected[i];
		var col = this.color(i);
		d3.select(pathObject).style('fill', col);
	}
	
	/* Draw a ring segment
	 * i: data index, used to compute angles
	 */
	draw_arc(i) {
		return d3.arc()
			.innerRadius(this.inrad)
			.outerRadius(this.outrad)
			.startAngle(i * this.r_length)
			.endAngle(i * this.r_length + this.a_size);
	}
	
	/* Return the selected arcs
	 */
	get selection() {
		return this.selected;
	}
	
	/* Draw the whole ring, need to be called by the user
	 */
	draw() {
		var that = this;
		// var seg = this.svg.selectAll(this.id).data(this.data);
		this.svg.selectAll(this.id).data(this.data).enter()
			.append('path')
			.attr('transform', 'translate('+that.cx+', '+that.cy+')')
			.attr('d', function(d, i) { return that.draw_arc(i)(); })
			.attr('fill', function(d, i) { return that.color(i); })
			.on('mousemove', function(d) { that.mouse_move(d, this); })
			.on('mouseout', function(d,i) { that.mouse_out(i, this); })
			.on('mouseover', function(d, i) {that.mouse_over(i, this);})
			.on('click', function(d, i) {that.on_click(i, this);});
	}
}