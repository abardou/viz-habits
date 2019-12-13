<template>
	<div class="home">
		<v-container grid-list-xs>
			<v-card>
				<v-card>
					<!-- {{ timePickerSelection }}
					<TimePeriodPicker /> -->
					<!-- <Map /> -->
					<!-- <UserFilter :users="['User1', 'User2', 'User3']" /> -->
					<FilterGroup :filtersname="['UserFilter']" />
					<RangeSlider
						:data="[1.00e2,4.70e1,7.70e1,2.50e1,2.90e1,7.30e1,7.00e1,6.80e1,4.50e1,5.80e1,5.60e1,6.50e1,5.70e1,6.10e1,8.60e1,5.30e0,8.70e1,5.10e1,4.80e1,8.20e1,6.70e1,7.10e1,4.90e1,6.40e1,1.50e1,5.90e1,7.60e1,1.20e1,6.80e1,2.00e1,4.80e1,5.60e1,7.50e1,4.60e1,7.20e1,5.80e1,1.00e2,6.30e1,5.80e1,2.30e1,5.30e1,6.10e1,6.80e1,7.00e1,4.30e1,7.10e1,6.00e1,3.50e1,7.10e1,9.20e1,9.60e1,3.40e1,8.00e1,3.90e1,7.50e1,5.80e1,4.30e1,7.90e1,8.50e1,8.30e1,6.20e1,7.50e1,8.00e1,6.10e1,6.90e1,6.60e1,7.00e1,4.80e1,3.10e1,8.30e1,4.70e1,7.10e1,9.80e1,6.20e1,4.40e1,6.50e1,8.10e1,5.30e1,6.20e1,5.10e1,6.60e1,6.80e1,7.90e1,4.00e1,5.30e1,9.00e1,5.60e1,4.50e1,6.60e1,6.40e1,4.00e0,5.80e1,3.00e1,6.50e1,9.40e1,4.90e1,7.00e1,6.30e1,6.10e1,1.10e2,111]"
						:step="4"
					/>
				</v-card>
			</v-card>
		</v-container>
	</div>
</template>

<script>
// @ is an alias to /src
// import Timeline from '@/components/Timeline.vue';
// import FrequencyRange from '@/components/FrequencyRange.vue';
// import TimePeriodPicker from '@/components/TimePeriodPicker.vue';
// import Map from '@/components/Map.vue';
import FilterGroup from '@/components/FilterGroup.vue';
import RangeSlider from '@/components/filters/RangeSlider.vue';

export default {
	name: 'Home',
	components: {
		// Timeline,
		// FrequencyRange,
		// Map,
		// TimePeriodPicker,
		FilterGroup,
		RangeSlider
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
