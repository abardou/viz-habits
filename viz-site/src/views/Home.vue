<template>
	<div class="home">
		<v-container v-if="fetched" fluid>
			<v-row dense>
				<v-col cols="5">
					<v-card>
						<FilterGroup />	
					</v-card>
				</v-col>
				<v-col cols="7">
					<v-card>
						<ForceGraph />
					</v-card>
				</v-col>
			</v-row>
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
		FilterGroup,
		ForceGraph
	},
	data: () => ({
		fetched: false
	}),
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

		fetch('dataset.json').then(async resp => {
			let data = await resp.json();
			data = data.filter(d => d['App Name'] != 'Screen off' && !d['App Name'].startsWith('Screen on'));
			// const str = JSON.stringify(data);
			this.$store.commit('setDataset', data);
			this.fetched = true;
		});
	}
};
</script>
