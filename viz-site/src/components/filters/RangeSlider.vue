<template>
	<v-container style="display: inline">
		<div :id="htmlid+'-tt1'" class="hidden tooltip" />
		<div :id="htmlid+'-tt2'" class="hidden tooltip" />
		<svg :id="htmlid" />
	</v-container>
</template>
 
<script>
import * as d3 from 'd3';

export default {
	name: 'RangeSlider',
	props: {
		data: {
			default: null,
			type: Array
		},
		step: {
			default: null,
			type: Number
		},
		htmlid: {
			default: null,
			type: String
		}
	},
	data: () => ({
		svg: null,
		bins: null,
		thickness: 5,
		cursorRad: 7,
		selColor: '#69b3a2',
		unselColor: '#ddd',
		margin: {top: 10, left: 10, right:10, bottom:10, bet: 15},
		selected: [0, 1],
		heightHist: 175,
		width: 400,
		tooltips: null
	}),
	computed: {
		min: function() {
			return this.data.reduce((a, b) => Math.min(a, b));
		},
		max: function() {
			return this.data.reduce((a, b) => Math.max(a, b));
		},
		range: function() {
			return [this.min + 0.2*(this.max - this.min), this.min + 0.8*(this.max - this.min)];
		}
	},
	mounted() {
		let that = this;
		this.width = this.width - this.margin.left - this.margin.right;

		this.tooltips = [d3.select('#'+this.htmlid+'-tt1'), d3.select('#'+this.htmlid+'-tt2')];
		this.svg = d3.select('#'+this.htmlid)
			.attr('width', this.width + this.margin.left + this.margin.right)
			.attr('height', this.heightHist + this.margin.bet + this.thickness + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', 'translate('+this.margin.left+','+this.margin.top+')');

		let nbBins = (this.max - this.min) / this.step;

		// Draw histogram
		var x = d3.scaleLinear()
			.domain([this.min, this.max])
			.range([0, this.width]);

		var y = d3.scaleLinear()
			.range([this.heightHist, 0]);

		var histogram = d3.histogram()
			.domain(x.domain())
			.thresholds(x.ticks(nbBins));
		this.bins = histogram(this.data);
		this.selected = [this.bins[parseInt(0.25*this.bins.length)].x0, this.bins[parseInt(0.75*this.bins.length)].x1];

		y.domain([0, d3.max(this.bins, function(d) { return d.length; })]);

		var u = this.svg.selectAll('rect')
			.data(this.bins);

		u.enter()
			.append('rect') // Add a new rect for each new elements
			.attr('x', d => x(d.x0))
			.attr('y', d => y(d.length))
			.attr('width', function(d) { return x(d.x1) - x(d.x0) - 1; })
			.attr('height', function(d) { return that.heightHist - y(d.length); })
			.style('fill', d => d.x0 >= this.selected[0] && d.x1 <= this.selected[1] ? this.selColor : this.unselColor);

		this.draw_slider_line(x);
			
		this.svg.selectAll('cursors').data(this.selected)
			.enter()
			.append('circle')
			.attr('cx', d => x(d))
			.attr('cy', this.heightHist + this.margin.bet)
			.attr('r', this.cursorRad)
			.style('fill', this.selColor)
			.on('mouseover', () => that.show_tooltips())
			.on('mouseout', () => that.hide_tooltips())
			.call(d3.drag()
				.on('start', () => that.show_tooltips())
				.on('drag', (d, i) => this.dragged(i))
				.on('end', () => that.hide_tooltips())
			);
	},
	methods: {
		dragged(idx) {
			this.show_tooltips();

			let x = d3.scaleLinear()
				.domain([this.min, this.max])
				.range([0, this.width]);
			let bin_idx = this.get_cursor_index(idx, x);
			let attr = 'x'+idx;

			this.selected[idx] = this.bins[bin_idx][attr];
			this.draw_slider_line(x, false);
			this.svg.selectAll('circle')
				.filter((d, i) => i == idx)
				.attr('cx', x(this.bins[bin_idx][attr]));

			this.svg.selectAll('rect')
				.style('fill', d => d.x0 >= this.selected[0] && d.x1 <= this.selected[1] ? this.selColor : this.unselColor);
		},

		get_cursor_index(idx, x) {
			// Get bin index
			let other_curs = this.svg.selectAll('circle').filter((d, i) => i != idx).attr('cx');
			let other_idx = this.get_point_index(other_curs, 'x'+(1-idx), this.bins, x);

			let attr = 'x'+idx;
			let diffs = this.bins.filter((d, i) => idx == 1 && i >= other_idx || idx == 0 && i <= other_idx)
				.map(d => Math.abs(x(d[attr]) - d3.event.x));
			let bin_idx = 0;
			for (let i = 1; i < diffs.length; i++) {
				if (diffs[i] < diffs[bin_idx])
					bin_idx = i;
			}
			bin_idx += idx == 1 ? other_idx : 0;

			return bin_idx;
		},

		get_point_index(posx, attr, bins, x) {
			let diffs = bins.map(d => Math.abs(x(d[attr]) - posx));
			let bin_idx = 0;
			for (let i = 1; i < diffs.length; i++) {
				if (diffs[i] < diffs[bin_idx])
					bin_idx = i;
			}

			return bin_idx;
		},

		draw_slider_line(x, full=true) {
			// Draw slider
			let l_cor = [
				{x0: this.min, x1: this.max, c:this.unselColor, d:full},
				{x0: this.selected[0], x1: this.selected[1], c:this.selColor, d:true}
			].filter(d => d.d);

			let to_rem = d3.select('#'+this.htmlid).selectAll('line');
			if (!full)
				to_rem = to_rem.filter((d, i) => i == 1);
			to_rem.remove();

			this.svg.selectAll('slines').data(l_cor)
				.enter()
				.append('line')
				.attr('x1', d => x(d.x0))
				.attr('y1', this.heightHist + this.margin.bet)
				.attr('x2', d => x(d.x1))
				.attr('y2', this.heightHist + this.margin.bet)
				.attr('stroke', d => d.c)
				.attr('stroke-width', this.thickness);
		},

		show_tooltips() {
			let that = this;

			this.svg.selectAll('circle')
				.each(function(d, i) {
					let matrix = this.getScreenCTM()
						.translate(this.getAttribute('cx')-3*that.width/4, (parseInt(this.getAttribute('r')) + parseInt(this.getAttribute('cy')))/2);
					that.tooltips[i].classed('hidden', false)
						.style('left', (window.pageXOffset + matrix.e) + 'px')
						.style('top', (window.pageYOffset + matrix.f + 25) + 'px')
						.html(d);
				});
		},

		hide_tooltips() {
			this.svg.selectAll('circle')
				.each((d, i) => {
					this.tooltips[i].classed('hidden', true);
				});
		}
	}
};
</script>

<style>
.hidden {
	display: none;
}

div.tooltip {
	color: #222;
	background-color: #fff;
	padding: .4em;
	border-radius: 2px;
	opacity: 0.9;
	position: absolute;
}
</style>