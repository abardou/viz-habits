<template>
	<v-container :id="'container-' + htmlid" style="display: inline">
		<svg :id="htmlid" />
	</v-container>
</template>
 
<script>
import * as d3 from 'd3';
import { htmlToElement } from '@/utils/elementCreation.js';

export default {
	name: 'RangeSlider',
	props: {
		subject: { // time | switch
			default: null,
			type: String
		},
		nbbins: {
			default: null,
			type: Number
		},
		delta: { // Useful for switch
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
		heightHist: 100,
		width: 400,
		tooltips: null,
		utime: null,
		links: null,
		min: null,
		max: null,
		app_names: null,
		pp_data: null
	}),
	computed: {
		tooltip_style() {
			return `
				color: ${this.selColor};
				background-color: #fff;
				padding: .4em;
				border-radius: 10px;
				border: 2px solid ${this.selColor};
				font-size: 0.8em;
				font-weight: bold;
				opacity: 0.9;
				position: absolute;
			`;
		}
	},
	mounted() {
		this.$root.$on('redrawSlider', () => { this.build_slider(); });

		this.width = document.getElementById('container-' + this.htmlid).offsetWidth + 50;
		this.width = this.width - this.margin.left - this.margin.right;

		this.tooltips = [
			d3.select('body').append(() => 
				htmlToElement(`<div id="${this.htmlid}-tt1" style="${this.tooltip_style}" class="hidden tooltipSlider" />`)
			), 
			d3.select('body').append(() => 
				htmlToElement(`<div id="${this.htmlid}-tt2" style="${this.tooltip_style}" class="hidden tooltipSlider" />`)
			)
		];

		this.svg = d3.select('#'+this.htmlid)
			.attr('width', this.width + this.margin.left + this.margin.right)
			.attr('height', this.heightHist + this.margin.bet + this.thickness + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', 'translate('+this.margin.left+','+this.margin.top+')');

		this.build_slider();
	},
	methods: {
		sendEvent() {
			const toDel = [];

			// Selection for time
			if (this.subject == 'time') {
				const app_to_del = [];

				for (const i in this.utime) {
					if (this.utime[i] < this.selected[0] || this.utime[i] > this.selected[1])
						app_to_del.push(i);
				}

				for (const i in this.$store.state.fdata) {
					if (app_to_del.indexOf(this.$store.state.fdata[i]['App Name']) != -1) {
						toDel.push(parseInt(i));
					}
				}
			} else if (this.subject == 'switch') {
				// Selection for switch
				for (const i in this.links) {
					for (const j in this.links[i]) {
						if (this.links[i][j] < this.selected[0] || this.links[i][j] > this.selected[1]) {
							toDel.push([i, j]);
						}
					}
				}
			}

			this.$emit('rangeChange', toDel, this.htmlid);
		},
		_app_names() {
			let an = new Set();
			for (let d of this.$store.state.fdata) {
				an.add(d['App Name']);
			}
			return Array.from(an);
		},
		_pp_data() {
			if (this.subject == 'time') {
				const tu = this.time_usage();
				const res = [];

				for (const v of Object.values(tu)) {
					res.push(v);
				}

				return res;
			} else if (this.subject == 'switch') {
				const switches = this.switches();
				const res = [];
				for (const deb in switches) {
					for (const value of Object.values(switches[deb])) {
						if (value != 0) {
							res.push(value);
						}
					}
				}

				return res;
			}

			return null;
		},
		_min() {
			return this.pp_data.reduce((a, b) => Math.min(a, b));
		},
		_max() {
			return this.pp_data.reduce((a, b) => Math.max(a, b));
		},
		update_computed() {
			this.app_names = this._app_names();
			this.pp_data = this._pp_data();
			this.min = this._min();
			this.max = this._max();
		},
		build_slider() {
			this.update_computed();
			this.svg.selectAll('*').remove();

			let that = this;

			// Draw histogram
			var x = d3.scaleLinear()
				.domain([this.min, this.max])
				.range([0, this.width]);

			var y = d3.scaleLinear()
				.range([this.heightHist, 0]);

			var histogram = d3.histogram()
				.domain(x.domain())
				.thresholds(x.ticks(this.nbbins));

			this.bins = histogram(this.pp_data);
			this.selected = [this.bins[0].x0, this.bins[this.bins.length-1].x1];

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
					.on('end', () => {that.hide_tooltips(); that.sendEvent();})
				);
		},
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
			let that = this;
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
				.attr('stroke-width', this.thickness)
				.on('mouseover', () => that.show_tooltips())
				.on('mouseout', () => that.hide_tooltips());
		},

		show_tooltips() {
			let that = this;

			this.svg.selectAll('circle')
				.each(function(d, i) {
					that.tooltips[i].classed('hidden', false)
						.style('left', (window.pageXOffset + this.getBoundingClientRect().left - that.cursorRad) + 'px')
						.style('top', (window.pageYOffset + this.getBoundingClientRect().top + 25) + 'px')
						.html(that.selected[i]);
				});
		},

		hide_tooltips() {
			this.svg.selectAll('circle')
				.each((d, i) => {
					this.tooltips[i].classed('hidden', true);
				});
		},

		time_usage() {
			const tu = {};
			const data = JSON.parse(JSON.stringify(this.$store.state.fdata));

			for (const d of data) {
				const name = d['App Name'];
				if (!tu[name]) {
					tu[name] = 0;
				}
				tu[name] += d['Duration'];
			}

			this.utime = tu;
			return tu;
		},

		switches() {
			let users = new Set();
			const data = JSON.parse(JSON.stringify(this.$store.state.fdata));

			for (let d of data)
				users.add(d['User_ID']);

			// Fill the matrix with each user sequence
			// let mt = new Array(this.app_names.length).fill(0).map(() => new Array(this.app_names.length).fill(0));

			const mt = {};
			for (const app_name of this.app_names) {
				mt[app_name] = {};

				for (const app_name2 of this.app_names) {
					mt[app_name][app_name2] = 0;
				}
			}

			for (const uid of users) {
				// Build the user sequence
				let f_data = data
					.filter(d => d['User_ID'] == uid)
					.sort(function(a, b) { return a.Time - b.Time; });

				let mem = undefined;
				let mem_time = undefined;

				// Loop through the user sequence and compute switches
				for (const d of f_data) {
					const app_name = d['App Name'];

					if (mem != undefined && mem != app_name && (d['Time'] - mem_time) < this.delta) {
						mt[mem][app_name] += 1;
					}

					mem = app_name;
					mem_time = d['Time'];
				}
			}

			this.links = mt;

			return mt;
		}
	}
};
</script>

<style>
.hidden {
	display: none;
}
</style>
