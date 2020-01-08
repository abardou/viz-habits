<template>
	<v-container id="picker-component">
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
		this.tooltip = d3.select(document.getElementById('picker-container')).append(() => htmlToElement('<div class="hidden tooltipTimePicker" />'));

		this.initialized = true;
	},
	methods: {
		ringChange(data, name) {
			this.timePicker[name] = data;
			// Construction du graph au tout début
			if (Object.keys(this.timePicker).length < 3) return;

			const toDel = [];

			for (const [i, d] of this.$store.state.data.entries()) {
				if (isNaN(d.Time)) {
					toDel.push(i);
					continue;
				}

				// Days : getDay() returns [0 .. 6] [Sunday .. Saturday]
				const date = new Date(d.Time * 1000);
				// [Sunday .. Saturday] => [Monday .. Sunday]
				let day = date.getDay() - 1;
				if (day == -1) {
					day = 6;
				}

				if (!this.timePicker['days'][day]) {
					toDel.push(i);
					continue;
				}

				if (!this.timePicker['hours'][date.getHours()]) {
					toDel.push(i);
					continue;
				}

				const minutesRange = Math.floor(date.getMinutes() / this.granularity_minutes);
				if (!this.timePicker['minutes'][minutesRange]) {
					toDel.push(i);
					continue;
				}
			}
			this.$emit('timePickerChange', toDel);
		}
	}
};
</script>

<style>
.hidden {
	display: none;
}

div#picker-component {
	position: relative;
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
	z-index: 1000;
}
</style>
