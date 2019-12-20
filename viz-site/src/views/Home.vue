<template>
	<div class="home">
		<v-container>
			<v-card>
				<v-card>
					<FilterGroup />					
					<!-- <RadialTree :options="{}" /> -->
				</v-card>
			</v-card>
		</v-container>
	</div>
</template>

<script>
// Filters
import FilterGroup from '@/components/FilterGroup.vue';
import ForceGraph from '@/components/visus/ForceGraph.vue';
import RadialTree from '@/components/visus/RadialTree.vue';

export default {
	name: 'Home',
	components: {
		// Timeline,
		// FrequencyRange,
		// Map,
		// TimePeriodPicker,
		FilterGroup,
		// RadialTree
		// MapFilter
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
		let xobj = new XMLHttpRequest();
		xobj.overrideMimeType('application/json');
		xobj.open('GET', '../../../data/dataset.json', true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == '200') {
				let data = JSON.parse(xobj.responseText);
				this.$store.commit('data', data);
			}
		};
	}
};
</script>
