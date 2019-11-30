<template>
	<v-container>
		<v-container id="picker-container" />
	</v-container>
</template>

<script>
import * as d3 from 'd3';
import Ring from './Ring.js';

export default {
	name: 'TimePeriodPicker',
	data: () => ({
		// Tooltip for days
		daysTooltips: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		granularity_minutes: 5,
		daysRing: null,
		hoursRing: null,
		minutesRing: null
	}),
	computed: {
		hoursTooltips() {
			// Tooltip for hours
			const tt2 = [...Array(24).keys()];
			for (let i in tt2) {
				tt2[i] = (i > 12 ? `${i - 12}pm` : `${i}am`);
			}
			return tt2;
		},
		minutesTooltips() {
			// Granularity for minutes
			const g_min = this.granularity_minutes;

			// Tooltip for minutes
			const tt3 = [...Array(60/g_min).keys()];			
			for (let i = 0; i < tt3.length; i++) {
				tt3[i] = (g_min > 1 ? `${i*g_min}-${(i+1)*g_min}` : i);
			}
			return tt3;
		}
	},
	watch: {
		daysRing: {
			handler: function (val, oldVal) {
				console.log(val);
				console.log(oldVal);
			},
			deep: true
		},
	},
	mounted() {
		// Svg variable
		var svg = d3.select('#picker-container').append('svg')
			.attr('width', 960)
			.attr('height', 500);
		
		// Tooltip div
		var tooltip = d3.select('#picker-container').append('div').attr('class', 'hidden tooltip');	
		
		// Rings
		this.daysRing = new Ring(svg, tooltip, 'ring_1', 480, 250, 132, 112, '#374d7c', '#ddd', this.daysTooltips);
		this.hoursRing = new Ring(svg, tooltip, 'ring_2', 480, 250, 106, 86, '#46edc8', '#ddd', this.hoursTooltips);		
		this.minutesRing = new Ring(svg, tooltip, 'ring_3', 480, 250, 80, 60, '#fdf289', '#ddd', this.minutesTooltips);
		
		this.daysRing.draw();
		this.hoursRing.draw();
		this.minutesRing.draw();

		this.$store.commit('setDaysSelection', this.daysRing.selection);
		this.$store.commit('setHoursSelection', this.hoursRing.selection);
		this.$store.commit('setMinutesSelection', this.minutesRing.selection);
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
</style>
