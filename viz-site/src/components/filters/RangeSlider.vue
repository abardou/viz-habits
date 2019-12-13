<template>
	<svg id="slider" />
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
		heightHist: {
			default: 175,
			type: Number
		},
		heightSlid: {
			default: 80,
			type: Number
		},
		width: {
			default: 400,
			type: Number
		}
	},
	data: () => ({
		svg: null,
		bins: null,
		thickness: 4,
		cursorRad: 7,
		selColor: '#69b3a2',
		unselColor: '#ddd',
		margin: {top: 10, left: 10, right:10, bottom:10, bet: 20},
		selected: [0, 1]
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

		this.svg = d3.select('#slider')
			.attr('width', this.width)
			.attr('height', this.heightHist + this.heightSlid + this.margin.bet + this.thickness)
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
		
		// Draw slider
		let l_cor = [
			{x0: 0, x1: this.selected[0], c:this.unselColor},
			{x0: this.selected[0], x1: this.selected[1], c:this.selColor},
			{x0: this.selected[1], x1: this.max, c:this.unselColor}
		];
		this.svg.selectAll('slines').data(l_cor)
			.enter()
			.append('line')
			.attr('x1', d => x(d.x0))
			.attr('y1', this.heightHist + this.margin.bet)
			.attr('x2', d => x(d.x1))
			.attr('y2', this.heightHist + this.margin.bet)
			.attr('stroke', d => d.c)
			.attr('stroke-width', this.thickness);
			
		this.svg.selectAll('cursors').data(this.selected)
			.enter()
			.append('circle')
			.attr('cx', d => x(d))
			.attr('cy', d => this.heightHist + this.margin.bet)
			.attr('r', this.cursorRad)
			.style('fill', this.selColor);
	}
};
</script>