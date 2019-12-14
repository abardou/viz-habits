<template>
	<div class="home">
		<v-container grid-list-xs>
			<v-card>
				<v-container grid-list-xs>
					<MapFilter />
				</v-container>
			</v-card>
		</v-container>
	</div>
</template>

<script>
// @ is an alias to /src
// import Timeline from '@/components/filters/Timeline.vue';
// import FrequencyRange from '@/components/filters/FrequencyRange.vue';
// import TimePeriodPicker from '@/components/filters/TimePeriodPicker.vue';
// import ForceGraph from '@/components/visus/ForceGraph.vue';
import MapFilter from '@/components/filters/MapFilter.vue';

export default {
	name: 'Home',
	components: {
		// Timeline,
		// FrequencyRange,
		MapFilter,
		// TimePeriodPicker,
		// ForceGraph
	},
	computed: {
		timePickerSelection: {
			get() {
				return this.$store.state.timePickerSelection;
			}
		},
	},
	mounted() {
		document.documentElement.addEventListener('mouseup', e => {
			this.$store.commit('setDraggingState', {
				dragging: false,
				dragStartRing: null,
				firstObject: null
			});
		});
	}
};
</script>
