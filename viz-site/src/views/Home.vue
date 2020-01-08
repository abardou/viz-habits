<template>
	<div class="home">
		<v-container v-if="fetched" fluid>
			<v-row dense>
				<v-col cols="5">
					<v-card>
						<FilterGroup @changeVisu="changeVisu" />	
					</v-card>
				</v-col>
				<v-col cols="7">
					<v-card>
						<ForceGraph v-if="visu" />
						<RadialTree v-else />
					</v-card>
				</v-col>
			</v-row>
		</v-container>
		<v-container v-else style="text-align: center;">
			<v-progress-circular
				style="margin-top: 200px;"
				:size="200"
				:width="20"
				color="red"
				indeterminate
			/>
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
		ForceGraph,
		RadialTree
	},
	data: () => ({
		fetched: false,
		// True: forceGraph False : dendogram
		visu: true
	}),
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
			this.$store.commit('setFilteredDataset', data);
			this.$store.commit('setFinalDataset', data);
			this.fetched = true;
		});
	},
	methods: {
		changeVisu(data) {
			this.visu = data;
		}
	}
};
</script>
