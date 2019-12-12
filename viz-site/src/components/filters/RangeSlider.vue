<template>
	<v-container>
		<v-row>
			<v-container id="slider-container" />
			<v-col cols="3" sm="12" md="3">
				<v-range-slider
					v-model="selected"
					thumb-label="always"
					:min="min"
					:max="max"
					:step="step"
				/>
			</v-col>
		</v-row>
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
		height: {
			default: 175,
			type: Number
		},
		width: {
			default: 400,
			type: Number
		}
	},
	data: () => ({
		svg: null,
		selected: [5, 10]
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
		},
		bins: function() {
			let nb_bins = (this.max - this.min) / this.step;
			let b = new Array(nb_bins).fill(0);

			// Fill the bins
			for (let d of this.data) {
				let ibin = Math.floor((d - this.min) / this.step);
				b[ibin] += 1;
			}

			return b;
		}
	},
	mounted() {
		let that = this;

		this.svg = d3.select('#slider-container').append('svg')
			.attr('width', this.width)
			.attr('height', this.height);

		let nbBins = (this.max - this.min) / this.step;

		var x = d3.scaleLinear()
			.domain([this.min, this.max])
			.range([0, this.width]);

		var y = d3.scaleLinear()
			.range([this.height, 0]);

		var histogram = d3.histogram()
			.domain(x.domain())
			.thresholds(x.ticks(nbBins));
		var bins = histogram(this.data);

		y.domain([0, d3.max(bins, function(d) { return d.length; })]);

		var u = this.svg.selectAll('rect')
			.data(bins);

		u.enter()
			.append('rect') // Add a new rect for each new elements
			.attr('x', d => x(d.x0))
			.attr('y', d => y(d.length))
			.attr('width', function(d) { return x(d.x1) - x(d.x0) - 1; })
			.attr('height', function(d) { return that.height - y(d.length); })
			.style('fill', '#69b3a2');
		
	}
};
</script>