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

export default {
	name: 'Home',
	components: {
		// Timeline,
		// FrequencyRange,
		// Map,
		// TimePeriodPicker,
		FilterGroup
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
