<template>
	<v-container id="picker-component">
		{{ label }}
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
			selcol="#4CAF50"
			unselcol="#666"
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
			selcol="#f5f9f9"
			unselcol="#666"
			:data="hoursTooltips"
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
		svg: null,
		tooltip: null,
		initialized: false,
		cx: null,
		timePicker: {},
		label: 'Période temporelle (jours, heures)'
	}),
	computed: {
		// Tooltip for hours
		hoursTooltips() {
			const tt2 = [...Array(24).keys()];
			for (let i in tt2) {
				tt2[i] = (i > 12 ? `${i - 12}pm` : `${i}am`);
			}
			return tt2;
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
			if (Object.keys(this.timePicker).length < 2) return;

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
