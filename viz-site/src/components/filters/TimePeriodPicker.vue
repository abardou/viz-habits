<template>
	<v-container>
		<v-container id="picker-container" />
		<Ring
			v-if="initialized"
			id="ring_1"
			name="days"
			:svg="svg"
			:tooltip="tooltip"
			:cx="cx"
			:cy="135"
			:outrad="132"
			:inrad="112"
			selcol="#374d7c"
			unselcol="#ddd"
			:data="daysTooltips"
			@ringChange="ringChange"
		/>
		<Ring
			v-if="initialized"
			id="ring_2"
			name="hours"
			:svg="svg"
			:tooltip="tooltip"
			:cx="cx"
			:cy="135"
			:outrad="106"
			:inrad="86"
			selcol="#46edc8"
			unselcol="#ddd"
			:data="hoursTooltips"
			@ringChange="ringChange"
		/>
		<Ring
			v-if="initialized"
			id="ring_3"
			name="minutes"
			:svg="svg"
			:tooltip="tooltip"
			:cx="cx"
			:cy="135"
			:outrad="80"
			:inrad="60"
			selcol="#fdf289"
			unselcol="#ddd"
			:data="minutesTooltips"
			@ringChange="ringChange"
		/>
	</v-container>
</template>

<script>
import * as d3 from 'd3';
import Ring from '@/components/filters/subComponents/Ring.vue';
import { htmlToElement } from '@/utils/elementCreation.js';

export default {
	name: 'TimePeriodPicker',
	components: {
		Ring
	},
	data: () => ({
		// Tooltip for days
		daysTooltips: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		granularity_minutes: 5,
		svg: null,
		tooltip: null,
		initialized: false,
		cx: null,
		timePicker: {}
	}),
	computed: {
		// Tooltip for hours
		hoursTooltips() {
			const tt2 = [...Array(24).keys()];
			for (let i in tt2) {
				tt2[i] = (i > 12 ? `${i - 12}pm` : `${i}am`);
			}
			return tt2;
		},
		// Tooltip for minutes
		minutesTooltips() {
			// Granularity for minutes
			const g_min = this.granularity_minutes;

			const tt3 = [...Array(60/g_min).keys()];			
			for (let i = 0; i < tt3.length; i++) {
				tt3[i] = (g_min > 1 ? `${i*g_min}-${(i+1)*g_min}` : i);
			}
			return tt3;
		}
	},
	mounted() {
		const container = document.getElementById('picker-container');
		const width = container.offsetWidth;
		// Svg variable
		this.svg = d3.select(container).append('svg')
			.attr('width', width)
			.attr('height', 270);

		this.cx = width/2;
		
		// Tooltip div
		this.tooltip = d3.select('body').append(() => htmlToElement('<div class="hidden tooltipTimePicker" />'));

		this.initialized = true;
	},
	methods: {
		ringChange(data, name) {
			this.timePicker[name] = data;
			this.$emit('timePickerChange', this.timePicker);
		}
	}
};
</script>

<style>
.hidden {
	display: none;
}

div.tooltipTimePicker {
	color: black;
	background-color: #fff;
	padding: .4em;
	border-radius: 10px;
	border: 2px solid black;
	font-size: 1em;
	font-weight: bold;
	opacity: 0.9;
	position: absolute;
}
</style>
