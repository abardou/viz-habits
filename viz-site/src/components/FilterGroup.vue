<template>
	<v-container fluid pb-0>
		<v-row no-gutters>
			<v-col cols="6">
				<RangeSlider
					:subject="'time'"
					:nbbins="50"
					:htmlid="'time'"
					@rangeChange="rangeChange"
				/>
			</v-col>
			<v-col cols="6">
				<RangeSlider
					:subject="'switch'"
					:nbbins="50"
					:delta="10"
					:htmlid="'switch'"
					@rangeChange="rangeChange"
				/>
			</v-col>
			<v-col cols="6">
				<UserFilter :users="['User1', 'User2', 'User3']" @userChange="userChange" />
				<v-container pa-5>
					<v-checkbox v-model="mapFilterActive" :label="`MapFilter ${mapFilterActive ? 'actif' : 'inactif'}`" />
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
import UserFilter from '@/components/filters/UserFilter.vue';
import RangeSlider from '@/components/filters/RangeSlider.vue';
import MapFilter from '@/components/filters/MapFilter.vue';
import TimePeriodPicker from '@/components/filters/TimePeriodPicker.vue';

export default {
	name: 'FilterGroup',
	components: {
		UserFilter,
		RangeSlider,
		MapFilter,
		TimePeriodPicker
	},
	data: () => ({
		index_filtered: [new Set(), new Set(), new Set()],
		range_filtered: new Array(),
		edges_filtered: new Array(),
		mapFilterActive: true,
		// True : forceGraph False : Dendogram
		visuSwitch: true,
	}),
	methods: {
		changed(data) {
			this.$emit('changeVisu', data);
		},
		mapChange(data) {
			this.index_filtered[0] = new Set(data);
			this.filter_norange();
		},
		rangeChange(data, name) {
			if (this.name == 'time') {
				this.range_filtered = data;
			} else if (this.name == 'switch') {
				this.edges_filtered = data;
			}
		},
		userChange(data) {
			this.index_filtered[1] = new Set(data);
			this.filter_norange();
		},
		timePickerChange(data) {
			this.index_filtered[2] = new Set(data);
			this.filter_norange();
		}, 

		filter_norange() {
			let to_rem = this.index_filtered.reduce((a, b) => new Set([...a, ...b]));
			let fdata = this.$store.state.data.filter((d, i) => !to_rem.includes(i));
			this.$store.commit('setFilteredDataset', fdata);
		},

		filter_range() {
			let fdata = this.$store.state.fdata.filter((d, i) => !this.range_filtered.includes(i));
			this.$store.commit('setFinalDataset', fdata);
		}
	}
};
</script>