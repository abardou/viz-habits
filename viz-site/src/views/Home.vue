<template>
	<div class="home">
		<v-container grid-list-xs>
			<v-card>
				<!-- <Timeline />
				<FrequencyRange /> -->
				<v-card>
					{{ daysSelection }}
					<TimePeriodPicker />
				</v-card>
			</v-card>
		</v-container>
	</div>
</template>

<script>
// @ is an alias to /src
// import Timeline from '@/components/Timeline.vue';
// import FrequencyRange from '@/components/FrequencyRange.vue';
import TimePeriodPicker from '@/components/TimePeriodPicker.vue';
// import Map from '@/components/Map.vue';

export default {
	name: 'Home',
	components: {
		// Timeline,
		// FrequencyRange,
		// Map,
		TimePeriodPicker
	},
	computed: {
		daysSelection: {
			get() {
				return this.$store.state.daysSelection;
			}
		},
	},
	mounted() {
		document.documentElement.addEventListener('mouseup', e => {
			this.$store.commit('setDraggingState', {
				dragging: false,
				dragStartRing: null
			});
		});
	}
};
</script>
