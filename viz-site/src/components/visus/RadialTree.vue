<template>
	<v-container id="radial-container" style="box-shadow: 3px 3px 8px #000; position: relative;">
		<v-tooltip
			color="success"
			right
			max-width="200px"
		>
			<template v-slot:activator="{ on }">
				<help-icon
					id="graph-help"
					class="icon-bigger"
					title=""
					v-on="on"
				/>
			</template>
			<div>
				TOFIX
			</div>
		</v-tooltip>
	</v-container>
</template>

<script>
import * as d3 from 'd3';
import RadialTreeModel from '../../utils/radial_model';

export default {
	name: 'RadialTree',
	props: {
		options: {
			type: Object,
			default : null
		}
	},
	mounted () {

		const container = document.getElementById('radial-container');
		this.width = container.offsetWidth;
		this.height = 890;

		this.svg = d3.select('#radial-container').append('svg')
			.attr('width', this.width)
			.attr('height', this.height);

		this.tooltip = d3.select('#radial-container').append('div').attr('class', 'hidden tooltip');

		this.draw_graph();

		this.$root.$on('redrawForceGraph', () => {
			this.draw_graph(); });

	},



	// 	//this.renderChart(this.chartData, this.options);
	// 	//this.$emit('created', this.$data._chart);
	// 	fetch('dataset.json').then(async resp => {
	// 		let data = await resp.json();
	// 		this.rtm = new RadialTreeModel(data, 10);
	// 		// Apply last filters
	// 		// acm.apply_filters(0, 1e10, 0, 1);
	// 		// Build the visualization
	// 		this.rtm.filter_tree();
	// 		this.svg = d3.select('#radial-container').append('svg')
	// 			.attr('width', 1000)
	// 			.attr('height', 1000);
	// 		this.tooltip = d3.select('body').append('div').attr('class', 'hidden tooltip');
	// 		this.update_filters('Screen on (unlocked)', '1', 10, 'dendogram');
	// 	});
	//
	//
	//
	// 	// ? let displays = ['dendogram', 'tidy', 'line'];
	//
	// },
	methods: {
		draw_graph() {
			this.svg.selectAll('*').remove();
			let data = this.$store.state.finaldataRadial;


			console.log(data);
			this.rtm = new RadialTreeModel(data, 10);

			this.draw(this.rtm.get_tree());
		},

		get_correct_time(time){
			return time / 10;
		},
		get_size(time) {
			return Math.sqrt(this.get_correct_time(time) / Math.PI);
		},
		seconds_to_time(sec) {
			let h = Math.floor(sec / 3600);
			let hs = h > 0 ? h + 'h ' : '';
			sec = sec % 3600;
			let m = Math.floor(sec / 60);
			let ms = m > 0 ? m + 'm ' : '';
			let ss = (sec % 60) + 's';

			return hs + ms + ss;
		},
		draw(data) {
			let that = this;
			let width = 975;
			let radius = width / 2;
			let tree = d3.cluster().size([2 * Math.PI, radius - 100]);
			const root = tree(d3.hierarchy(data)
				.sort((a, b) => d3.ascending(a.data.name, b.data.name)));

			/*const svg = d3
				.select('body')
				.append('svg')
				.attr('id', 'tree')
				.style('max-width', '100%')
				.style('height', 'auto')
				.style('font', '10px sans-serif')
				.style('margin', '5px');*/

			const link = this.svg.append('g')
				.attr('id', 'links')
				.attr('fill', 'none')
				.attr('stroke', '#555')
				.attr('stroke-opacity', 0.4)
				.selectAll('path')
				.data(root.links())
				.enter().append('path')
				.attr('stroke-width', d => (d.target.data.nb_use) / 3)
				.attr('d', d3.linkRadial()
					.angle(d => d.x)
					.radius(d => d.y)
				)
				.on('mouseover', function(d) {
					that.enable_focus_path(d, that);
				})
				.on('mousemove', function(d) {
					let mouse_position = d3.mouse(d3.select('body').node());
					let nb_use = d.target.data.nb_use;
					let str = nb_use + ' sequences';
					if (nb_use == 1) {
						str = nb_use + ' sequence';
					}
					// on affiche le toolip
					that.tooltip.classed('hidden', false)
						// on positionne le tooltip
						.attr('style', 'left:' + (mouse_position[0] - width *4/5) +
						'px; top:' + (mouse_position[1] - 40) + 'px')
						// on recupere le nom de l'etat
						.html(str);
				})
				.on('mouseout', function() {
					that.tooltip.classed('hidden', true);
					// on cache le toolip
					that.disable_focus();
				});

			const node = this.svg.append('g')
				.attr('id', 'nodes')
				.attr('stroke-linejoin', 'round')
				.attr('stroke-width', 3)
				.selectAll('g')
				.data(root.descendants().reverse())
				.enter().append('g')
				.attr('transform', d => `
					rotate(${d.x * 180 / Math.PI - 90})
					translate(${d.y},0)`)
				.on('mouseover', function(d) {
					that.enable_focus_application(d, that);
				})
				.on('mousemove', function(d) {
					let mouse_position = d3.mouse(d3.select('body').node());
					// on affiche le toolip
					that.tooltip.classed('hidden', false)
						// on positionne le tooltip
						.attr('style', 'left:' + (mouse_position[0] - width *4/5) +
						'px; top:' + (mouse_position[1] - 40) + 'px')
						// on recupere le nom de l'etat 
						.html(d.data.name);
				})
				.on('mouseout', function() {
					that.tooltip.classed('hidden', true);
					// on cache le toolip
					that.disable_focus();
				})
				.on('click', function(d) {
					that.tools_ref.send_filters(d.data.name);
					that.tooltip.classed('hidden', true);
				});

			node.append('circle')
				.attr('fill', d => d.children ? '#555' : '#999')
				.attr('r', 2.5);
				
			const images = node.append('image')
				.attr('xlink:href', d => d.data.image)
				.attr('width', 30)
				.attr('height', 30)
				.attr('x', -15)
				.attr('y', -15);

			this.svg.attr('viewBox', autoBox);

			function autoBox() {
				const {x, y, width, height} = this.getBBox();
				return [x, y, width, height];
			}
		},
		enable_focus_path(edge, that) {
			let children = that.get_all_children(edge.target);
			let parents = that.get_all_parents(edge.target);

			d3.select('#links').selectAll('path')
				.attr('opacity', function(e) {
					if (!children.includes(e.target)) {
						return 0.2;
					}
					return 1;
				});

			d3.select('#nodes').selectAll('g')
				.attr('opacity', function(e) {
					if (!parents.includes(e) && !children.includes(e)) {
						return 0.2;
					}
					return 1;
				});
		},
		enable_focus_application(d, that) {
			let children = [];
			let parents = [];

			d3.select('#nodes').selectAll('g')
				.each(function(e) {
					if (d.data.name == e.data.name) {
						children = children.concat(that.get_all_children(e));
						parents = parents.concat(that.get_all_parents(e));
					}
				});
			let up_app = [];

			d3.select('#nodes').selectAll('g')
				.attr('opacity', function(e) {
					if (!parents.includes(e) && !children.includes(e)) {
						return 0.2;
					}
					up_app.push(e);
					return 1;

				});
			d3.select('#links').selectAll('path')
				.attr('opacity', function(e) {
					if (up_app.includes(e.target)) {
						return 1;
					}
					return 0.2;
				});
		},
		disable_focus() {
			d3.selectAll('#nodes').selectAll('g')
				.attr('opacity', () => {
					return 1;
				});
			d3.selectAll('#links').selectAll('path')
				.attr('opacity', () => {
					return 1;
				});
		},
		get_all_parents(d) {
			let res = [];

			while (d.parent != null) {
				res.push(d.parent);
				d = d.parent;
			}

			return res;
		},
		get_all_children(d) {
			let res = [];
			res.push(d);

			if (d.children != undefined) {
				for (let c of d.children) {
					let chi = this.get_all_children(c);

					res = res.concat(chi);

				}
			}
			return res;
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
		padding: .5em;
		text-shadow: #f5f5f5 0 1px 0;
		border-radius: 2px;
		opacity: 0.8;
		position: absolute;
		font-size: 8px;
	}
	.node circle {
		fill: #fff;
		stroke: steelblue;
		stroke-width: 3px;
	}

	.node text {
		font: 12px sans-serif;
	}

	.link {
		fill: none;
		stroke: #ccc;
		stroke-width: 2px;
	}

	text {
		font-family: sans-serif;
		font-size: 0.5em;
	}
</style>
