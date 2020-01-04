<template>
	<div class="home">
		<v-container fluid>
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
