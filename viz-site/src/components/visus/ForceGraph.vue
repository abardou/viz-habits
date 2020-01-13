<template>
	<v-container id="force-container" style="box-shadow: 3px 3px 8px #000; position: relative;">
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
				Les ronds de couleurs sous les titres d'applications dénotent quel utilisateur a utilisé cette application
			</div>
		</v-tooltip> 
	</v-container>
</template>

<script>
import * as d3 from 'd3';
import ForceModel from '../../utils/force_model';

export default {
	name: 'ForceGraph',
	data: () => ({
		svg: null,
		tooltip: null,
		width: null,
		height: null,
		toDelEdges: {},
		draggedNode: null
	}),
	computed: {
		cx: function() {
			return this.width/2; // the center of the graph visualization
		},
		cy: function() {
			return this.height/2; // the center of the graph visualization
		}
	},
	mounted() {
		const container = document.getElementById('force-container');
		this.width = container.offsetWidth;
		this.height = 890;

		this.svg = d3.select('#force-container').append('svg')
			.attr('width', this.width)
			.attr('height', this.height);

		this.tooltip = d3.select('#force-container').append('div').attr('class', 'hidden tooltip');

		this.draw_graph();

		this.$root.$on('redrawForceGraph', () => { this.draw_graph(); });

		this.$root.$on('handleEdgesForceGraph', (toDelEdges) => {
			this.toDelEdges = {};

			for (const edge of toDelEdges) {
				if (!this.toDelEdges[edge[0]]) {
					this.toDelEdges[edge[0]] = [];
				}
				this.toDelEdges[edge[0]].push(edge[1]);
			}

			this.draw_graph();
		});
	},
	methods: {
		draw_graph() {
			this.svg.selectAll('*').remove();
			let data = this.$store.state.finaldata;
			// let f = d => d['App Name'] != 'Screen off' && !d['App Name'].startsWith('Screen on');// && d['User_ID'] == 3;
			// data = data.filter(f);

			// Build the logical representation of the model
			let acm = new ForceModel(data, 10);
			data = acm.get_as_json();
			// console.log(data);

			// Build the visualization
			this.draw(acm.get_as_json());
		},
		/**
		 * @param {int} time the value of the node
		 *
		 * @returns {float} the time scaled at an adequate value
		 */
		get_correct_time(time) {
			return time / 30;
		},
		/**
		 * @param {float} time the time scaled to an adequate value
		 *
		 * @returns {float} the radius of the node
		 */
		get_radius(time) {
			return Math.sqrt(this.get_correct_time(time) / Math.PI) + 5;
		},
		/**
		 * @param {int} sec the number of seconds to convert
		 * 
		 * @returns {string} a string with time in hours, minutes and seconds
		 */ 
		seconds_to_time(sec) {
			const h = Math.floor(sec / 3600);
			const hs = h > 0 ? h + 'h ' : '';
			sec = sec % 3600;
			const m = Math.floor(sec / 60);
			const ms = m > 0 ? m + 'm ' : '';
			const ss = (sec % 60) + 's';

			return hs + ms + ss;
		},
		/**
		 * Set the opcaity of nodes and links according to their connections with node
		 * 
		 * @param {Object} node the node pointed by the mouse
		 * @param {Objects} nodes the nodes in the graph
		 * @param {Objects} links the links in the graph
		 */ 
		mouse_over(node, nodes, links) {
			if (this.draggedNode != null) {
				node = this.draggedNode;
			}

			const to_keep = new Set();

			// Set smaller opacity for links not connected to node
			// Build the list of nodes to keep
			links
				.filter(d => {
					const f = d.source.id != node.id && d.target.id != node.id && d.value > 0;
					if (!f && d.value > 0)
						to_keep.add(d.source.id == node.id ? d.target.id : d.source.id);

					return f;
				})
				.style('opacity', 0.1);
									
			// Set opacity of nodes to remove
			nodes
				.filter(d => !to_keep.has(d.id) && d.id != node.id)
				.style('opacity', 0.1);
		},
		/**
		 * Reset opacity to 1 for all graph elements
		 * 
		 * @param {Objects} nodes the nodes of the graph
		 * @param {Objects} links the nodes of the graph
		 */
		mouse_out(nodes, links) {
			links.style('opacity', 1);
			nodes.style('opacity', 1);
		},
		/**
		 * Draw the graph in the provided svg object
		 * 
		 * @param {Object} graph the graph to visualize
		 */ 
		draw(graph) {
			let that = this;

			// Force simulation
			let simulation = d3.forceSimulation()
			// < 0, linked nodes will attract each other. Default 450
				.force('link', d3.forceLink().id(d => d.id).distance(d => 480))
			// Avoid colliding
				.force('collide', d3.forceCollide().radius(d => that.get_radius(d.time) + 20))
			// Avoid too dense agglomerates
				//.force('charge', d3.forceManyBody().strength(d => -Math.log10(d.time)))
			// Center of the graph
				.force('center', d3.forceCenter(this.cx, this.cy));


			let links = [];

			if (JSON.stringify(this.toDelEdges) === '{}') {
				links = graph.links;
			} else {
				for (const link of graph.links) {
					if (!(this.toDelEdges[link.source] && this.toDelEdges[link.source].includes(link.target))) {
						links.push(link);
					}
				}
			}

			// Link objects
			const link = this.svg.append('g')
				.attr('class', 'links')
				.selectAll('line')
				.data(links)
				.enter().append('line')
				.attr('stroke-width', d => Math.sqrt(d.value));

			// Node objects
			const node = this.svg.append('g')
				.attr('class', 'nodes')
				.selectAll('g')
				.data(graph.nodes)
				.enter().append('g')
			// Drag interaction
				.call(d3.drag()
					.on('start', function(d) { that.dragstarted(d, simulation); })
					.on('drag', function(d) { that.dragged(d); })
					.on('end', function(d) { that.dragended(d, simulation); }))
			// Hover, out interactions
				.on('mouseover', d => that.mouse_over(d, node, link))
				.on('mouseout', d => that.mouse_out(node, link));
											
			// Circles for the nodes
			const circles = node.append('circle')
				.attr('r', d => that.get_radius(d.time))
				.attr('fill', '#555')
				.attr('stroke', 'white');

			// Images within the circles
			const images = node.append('image')
				.attr('xlink:href', d => d.image)
				.attr('width', d => 2*that.get_radius(d.time))
				.attr('height', d => 2*that.get_radius(d.time))
				.attr('x', d => -that.get_radius(d.time))
				.attr('y', d => -that.get_radius(d.time));

			const labels = node.append('foreignObject')
				.attr('width', 140)
				.attr('height', 30)
				.attr('x', -70)
				.attr('y', d => 1.05*that.get_radius(d.time))
				.append('xhtml:body')
				.style('font-size', '10px')
				.style('text-align', 'center')
				.style('text-shadow', '0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black')
				// '#CC2A36', '#4F372D', '#00A0B0'
				.html(d => `
					<div>${d.id}</div>
					${d.only_one_user ? '' : `
					<div style="margin-top: -5px">
						${d.users.has(1) ? '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 40%; background-color: #CC2A36; border: #BBB 1px solid; "></span>' : ''}
						${d.users.has(2) ? '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 40%; background-color: #4F372D; border: #BBB 1px solid; "></span>' : ''}
						${d.users.has(3) ? '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 40%; background-color: #00A0B0; border: #BBB 1px solid; "></span>' : ''}
					</div>`}
				`);

			// Title for each node (stay over a node to see it)
			node.append('title')
				.text(d => d.id);

			// Apply simulation to nodes
			simulation
				.nodes(graph.nodes)
				.on('tick', function() { that.ticked(link, node); });

			// Apply simulation to links
			simulation.force('link')
				.links(links);
		},
		/**
		 * @param {Object} link the link of the node
		 * @param {Object} node the node to animate
		 */ 
		ticked(link, node) {
			link
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			node.attr('transform', d => `translate(${d.x},${d.y})`);
		},
		/**
		 * @param {Object} d the node object dragged
		 * @param {Simulation} simulation the simulation of the forces
		 */
		dragstarted(d, simulation) {
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
			this.draggedNode = d;
		},
		/**
		 * @param {Object} d the node object dragged
		 */ 
		dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		},
		/**
		 * @param {Object} d the node object dragged
		 * @param {Simulation} simulation the simulation of the forces
		 */
		dragended(d, simulation) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
			this.draggedNode = null;
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
	opacity: 0.9;
	position: absolute;
}

.links line {
	stroke: #6D6D6D;
}

#graph-help {
	position: absolute;
	top: 5px;
	left: 5px;
}
</style>