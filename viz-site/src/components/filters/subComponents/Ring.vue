<template>
	<div />
</template>

<script>
import * as d3 from 'd3';

export default {
	name: 'Ring',
	props: {
		svg: {
			default: null,
			type: Object
		},
		tooltip: {
			default: null,
			type: Object
		},
		id: {
			default: null,
			type: String
		},
		name: {
			default: null,
			type: String
		},
		cx: {
			default: null,
			type: Number
		},
		cy: {
			default: null,
			type: Number
		},
		outrad: {
			default: null,
			type: Number
		},
		inrad: {
			default: null,
			type: Number
		},
		selcol: {
			default: null,
			type: String
		},
		unselcol: {
			default: null,
			type: String
		},
		data: {
			default: null,
			type: Array
		},
	},
	data: () => ({
		selected: null,
		g: null
	}),
	computed: {
		l() {
			return this.data.length;
		},
		s_size() {
			return 1 / (this.l * Math.PI);
		},
		r_length() {
			return 2*Math.PI / this.l;
		},
		a_size() {
			return this.r_length - this.s_size;
		},
		draggingState() {
			return this.$store.state.draggingState;
		}
	},
	watch: {
		selected: {
			handler(value) {
				const key = this.name;
				this.$emit('ringChange', value, key);
			},
			deep: true
		}
	},
	mounted() {
		this.selected = new Array(this.l).fill(true);
		this.draw();
		this.parent = this.$el.parentNode;
	},
	methods: {
		/* Return the color of the ith segment in the ring
		* i : data index, used to resolve color
		*/
		color(i) {
			return this.selected[i] ? this.selcol : this.unselcol;
		},
	
		/* Called when the mouse moves on a ring segment
		* d: data value, included in the tooltip
		*/
		mouse_move(d, pathObject) {
			const mousePosition = d3.mouse(pathObject);

			const mpp = this.extendVector(mousePosition, 50);

			this.tooltip.classed('hidden', false)
				.style('left', (window.pageXOffset + mpp[0] + this.cx) + 'px')
				.style('top', (window.pageYOffset + mpp[1] + this.cy) + 'px')
				.html(d);
		},

		/**
		 * Extend a vector by a fixed length
		 * vector : the vector to extend
		 * toAdd : the length by wich you want to extend it
		 */
		extendVector(vector, toAdd) {
			// Get unit vector
			if (this.name == 'days') {
				toAdd += 10;
			}
			const currentLength = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
			const newLength = currentLength + toAdd;
			const newVector = [
				vector[0] / currentLength * newLength,
				vector[1] / currentLength * newLength
			];

			if (this.name == 'days') {
				newVector[0] -= 10;
			}

			return newVector;
		},

		/* Called when the mouse is over a ring segment
		* i: data index, used to resolve color
		*/
		mouse_over(i, pathObject) {
			if (!this.draggingState.dragging) {
				const col = this.selected[i] ? this.unselcol : this.selcol;
				d3.select(pathObject).style('fill', col);
			} else if (this.draggingState.dragStartRing && this.draggingState.dragStartRing.includes(pathObject)) {
				this.$set(this.selected, i, !this.selected[i]);

				const col = this.color(i);
				d3.select(pathObject).style('fill', col);
			}
		},
	
		/* Called when the mouse is out of a ring segment
		* i: data index, used to resolve color
		*/
		mouse_out(i, pathObject) {
			if (
				!this.draggingState.dragging
				|| !(this.draggingState.dragStartRing && this.draggingState.dragStartRing.includes(pathObject))
			) {
				const col = this.color(i);
				d3.select(pathObject).transition().duration(300).style('fill', col);
			}
			this.tooltip.classed('hidden', true);
		},
	
		/* Called when a ring segment is clicked
		* i: data index, used to update intern state
		*/
		on_click(i, pathObject) {
			this.$set(this.selected, i, !this.selected[i]);
			const col = this.color(i);
			d3.select(pathObject).style('fill', col);
		},
	
		/* Draw a ring segment
		* i: data index, used to compute angles
		*/
		draw_arc(i) {
			return d3.arc()
				.innerRadius(this.inrad)
				.outerRadius(this.outrad)
				.startAngle(i * this.r_length)
				.endAngle(i * this.r_length + this.a_size);
		},
	
		/* Draw the whole ring, need to be called by the user
		*/
		draw() {
			const ring = this;

			this.g = this.svg.append('g');
			
			this.g.selectAll(this.id).data(this.data).enter()
				.append('path')
				.attr('transform', `translate(${ring.cx}, ${ring.cy})`)
				.attr('d', function(d, i) { return ring.draw_arc(i)(); })
				.attr('fill', function(d, i) { return ring.color(i); })
				.on('mousemove', function(d) { ring.mouse_move(d, this); })
				.on('mouseout', function(d, i) { ring.mouse_out(i, this); })
				.on('mouseover', function(d, i) {ring.mouse_over(i, this);})
				// .on('click', function(d, i) {ring.on_click(i, this);})
				.on('mousedown', function(d, i, p) {
					ring.$set(ring.selected, i, !ring.selected[i]);
					ring.setDraggingState(true, p, d);
				})
				.on('mouseup', function(d, i) {
					ring.setDraggingState(false, null, null);
				});
		},

		setDraggingState(dragging, dragStartRing, firstObject) {
			this.$store.commit('setDraggingState', {
				dragging,
				dragStartRing,
				firstObject
			});
		}
	}
};
</script>
