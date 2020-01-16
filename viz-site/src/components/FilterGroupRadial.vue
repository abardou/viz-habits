<template>
	<v-container fluid pb-0 style="box-shadow: 3px 3px 8px #000">
		<v-row no-gutters>
			<v-col cols="6">
				<v-container pa-5>
					<RadialTreeUserFilter @userChange="userChange" />
					<v-switch v-model="visuSwitch" :label="`${visuSwitch ? 'Force Graph' : 'Dendogram'}`" @change="changed" />
				</v-container>
			</v-col>
			<v-col cols="6">
				<TimePeriodPicker @timePickerChange="timePickerChange" />
			</v-col>
			<MapFilter @mapChange="mapChange" />
		</v-row>
	</v-container>
</template>
<script>
import RadialTreeUserFilter from '@/components/filters/RadialTreeUserFilter.vue';
import RangeSlider from '@/components/filters/RangeSlider.vue';
import MapFilter from '@/components/filters/MapFilter.vue';
import TimePeriodPicker from '@/components/filters/TimePeriodPicker.vue';

export default {
	name: 'FilterGroupRadial',
	components: {
		MapFilter,
		TimePeriodPicker,
		RadialTreeUserFilter
	},
	data: () => ({
		// True : forceGraph False : Dendogram
		visuSwitch: false
	}),
	mounted() {
		this.index_filtered = [new Set(), new Set(), new Set()];
		this.range_filtered = new Array();
		this.edges_filtered = new Array();
	},
	methods: {
		changed(data) {
			this.$emit('changeVisu', data);
		},
		mapChange(data) {
			this.index_filtered[0] = new Set(data);
			this.filter_norange();
		},
		rangeChange(data, name) {
			if (name == 'time') {
				this.range_filtered = data;
				this.filter_range();
			} else if (name == 'switch') {
				this.edges_filtered = data;
				this.$root.$emit('handleEdgesForceGraph', this.edges_filtered);
			}
		},
		userChange(data) {
			console.log('ok');
			this.index_filtered[1] = new Set(data);
			this.filter_norange();
		},
		timePickerChange(data) {
			this.index_filtered[2] = new Set(data);
			this.filter_norange();
		},

		filter_norange() {
			let active_filters;
			active_filters = this.index_filtered;

			let to_rem = active_filters.reduce((a, b) => new Set([...a, ...b]));

			let fdataRadial = this.$store.state.data.filter((d, i) => !to_rem.has(i));
			this.$store.commit('setFilteredDataset', fdataRadial);
			this.$store.commit('setFinalDataset', fdataRadial);

			this.$root.$emit('redrawSlider');
			this.$root.$emit('redrawRadialTree');
		},

		filter_range() {
			//let fdata = this.$store.state.fdata.filter((d, i) => !this.range_filtered.includes(i));
			//this.$store.commit('setFinalDataset', fdata);
			this.$root.$emit('redrawRadialTreeGraph');
		}
	}
};
</script>