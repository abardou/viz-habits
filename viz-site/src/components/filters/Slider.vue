<template>
	<v-container :id="'container-' + htmlid" style="display: inline">
		{{ label }}
		<v-tooltip color="success" right max-width="200px">
			<template v-slot:activator="{ on }">
				<help-icon class="icon-bigger" title="" v-on="on" />
			</template>
			<div>
				{{ filterExplanation }}
			</div>
		</v-tooltip> 
		<svg :id="htmlid" />
	</v-container>
</template>
 
<script>
import * as d3 from 'd3';
import { htmlToElement } from '@/utils/elementCreation.js';

export default {
	name: 'Slider',
	props: {
		nbbins: {
			default: null,
			type: Number
		},
		htmlid: {
			default: null,
			type: String
		}
	},
	computed: {
		label() {
			return 'Largeur des chemins';
		},
		filterExplanation() {
			return 'Tooltip TODO';
		},
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
		this.setDefaultDataValues();
		
		this.$root.$on('redrawSlider', () => { this.build_slider(); });

		this.width = document.getElementById('container-' + this.htmlid).offsetWidth + 50;
		this.width = this.width - this.margin.left - this.margin.right;

		this.tooltips = [
			d3.select('body').append(() => 
				htmlToElement(`<div id="${this.htmlid}-tt" style="${this.tooltip_style}" class="hidden tooltipSlider" />`)
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
		setDefaultDataValues() {
			this.svg = null;
			this.bins = null;
			this.thickness = 5,
			this.cursorRad = 7,
			this.selColor = '#69b3a2',
			this.unselColor = '#666',
			this.margin = {top: 10, left: 10, right:10, bottom:10, bet: 15},
			this.selected = [0, 1],
			this.heightHist = 100,
			this.width = 400,
			this.tooltips = null,
			this.utime = null,
			this.links = null,
			this.min = null,
			this.max = null,
			this.pp_data = null,
			this.test = {},
			this.model = [];
			this.max_to_exclude = 0;
		},
		sendEvent() {
			const toDel = [];			

			for (let i in this.model) {
				if (this.model[i] < this.selected[0])
					toDel.push(i);
			}
			this.$emit('sliderChange', toDel);
		},
		_pp_data() {
			return this.sequences();
		},
		_min() {
			return this.pp_data.length == 0 ? 0 : this.pp_data.reduce((a, b) => Math.min(a, b));
		},
		_max() {
			return this.pp_data.length == 0 ? 1 : this.pp_data.reduce((a, b) => Math.max(a, b));
		},
		update_computed() {
			this.pp_data = this._pp_data();
			this.min = this._min();
			this.max = this._max();
		},
		build_slider() {
			this.update_computed();
			this.svg.selectAll('*').remove();

			let that = this;
			let nbins = Math.min(this.nbbins, this.max - this.min);

			// Draw histogram
			var x = d3.scaleLinear()
				.domain([this.min, this.max])
				.range([0, this.width]);

			var y = d3.scaleSqrt()
				.range([this.heightHist, 0]);

			var histogram = d3.histogram()
				.domain(x.domain())
				.thresholds(x.ticks(nbins));

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
				
			this.svg.selectAll('cursors').data([this.selected[0]]).enter()
				.append('circle')
				.attr('cx', x(this.selected[0]))
				.attr('cy', this.heightHist + this.margin.bet)
				.attr('r', this.cursorRad)
				.style('fill', this.selColor)
				.on('mouseover', () => that.show_tooltips())
				.on('mouseout', () => that.hide_tooltips())
				.call(d3.drag()
					.on('start', () => that.show_tooltips())
					.on('drag', () => this.dragged())
					.on('end', () => {that.hide_tooltips(); that.sendEvent();})
				);
			
			this.sendEvent();
		},
		dragged() {
			this.show_tooltips();

			let x = d3.scaleLinear()
				.domain([this.min, this.max])
				.range([0, this.width]);
			let bin_idx = this.get_cursor_index(x);
			let attr = 'x0';

			this.selected[0] = this.bins[bin_idx][attr];
			this.draw_slider_line(x, false);
			this.svg.selectAll('circle')
				.attr('cx', x(this.bins[bin_idx][attr]));

			this.svg.selectAll('rect')
				.style('fill', d => d.x0 >= this.selected[0] && d.x1 <= this.selected[1] ? this.selColor : this.unselColor);
		},

		get_cursor_index(x) {
			// Get bin index
			let attr = 'x0';
			let diffs = this.bins.map(d => Math.abs(x(d[attr]) - d3.event.x));
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
				{x0: this.selected[0], x1: this.max, c:this.selColor, d:true}
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
		sequences() {
			this.model = [];
			this.max_to_exclude = 0;

			let users = new Set();
			const data = JSON.parse(JSON.stringify(this.$store.state.fdata));

			let keys = Object.keys(data);
			for (let i = 0; i < keys.length; i++) {
				data[keys[i]]['row_id'] = i;
			}

			for (let d of data)
				users.add(d['User_ID']);

			let sequences_per_user = [];
			for (let uid of users) {
				let f_data = data.filter(d => d['User_ID'] == uid)
					.sort(function (a, b) {
						return a.Time - b.Time;
					});

				let sequences = [];
				let in_seq = false;
				let seq = [];
				for (let i of f_data) {
					if ((i['App Name'] === 'Screen on (unlocked)' && !in_seq) || (i['App Name'] === 'Screen on (unlocked)' && seq.length === 1)) {
						seq = [['Screen on (unlocked)', i['row_id']]];
						in_seq = true;
					} else {
						if (i['App Name'] == 'Screen off' && in_seq) {
							//seq.push("Screen off")
							sequences.push({'path': seq});
							in_seq = false;
						} else {
							if (in_seq) {
								if (seq.length > 1 && i['App Name'] == seq[seq.length - 1]) {
									continue;
								}
								seq.push([i['App Name'], i['row_id']]);
							}
						}
					}
				}

				var goal = sequences.reduce(function (carry, pathEntry) {
					// On every path entry, resolve using the base object
					pathEntry.path.reduce(function (pathObject, pathName) {
						// For each path name we come across, use the existing or create a subpath
						pathObject[pathName[0]] = pathObject[pathName[0]] || {'nb_use': 0, 'row_id' : []};
						// Then return that subpath for the next operation
						pathObject[pathName[0]]['nb_use'] += 1;
						pathObject[pathName[0]]['row_id'].push(pathName[1]);
						return pathObject[pathName[0]];
						// Use the passed in base object to attach our resolutions
					}, carry);
					// Return the base object for suceeding paths, or for our final value
					return carry;
					// Create our base object
				}, {});

				sequences_per_user.push(goal);
			}
			let s = sequences_per_user[0];
			let app_name = Object.keys(s)[0];
			//console.log(this.user_sequences[Object.keys(this.user_sequences)[0]][app_name]);
			this.set_app_nb_use_by_index(app_name, s[app_name]);

			let result = [];
			let test_keys = Object.keys(this.test);
			for (let i = 0; i < keys.length; i++) {
				if (test_keys.includes(i.toString())) {
					result.push(this.test[i][1]);
				} else {
					result.push(0);
				}
			}

			let to_ret = this.model.filter(d => d != this.max_to_exclude);
			this.model = result;

			return to_ret;
		},
		set_app_nb_use_by_index(app_name, values) {
			let old = Object.keys(values);
			if (old.length > 0) {
				for (let b of old) {
					if (b != 'nb_use' && b != 'row_id') {
						this.set_app_nb_use_by_index(b, values[b]);
					}
				}
			}
			this.model.push(values['nb_use']);
			if (values['nb_use'] > this.max_to_exclude)
				this.max_to_exclude = values['nb_use'];
			for (let i of values['row_id']) {
				this.test[i] = [app_name, values['nb_use']];
			}
		}
	}
};
</script>

<style>
.hidden {
	display: none;
}
</style>
