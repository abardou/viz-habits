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
	props: {
		dataset: {
			default: null,
			type: Object
		}
	},
	data: () => ({
		index_filtered: {
			default: {'user': [], 'map': [], 'range': [], 'time': []},
			type: Object
		}
	}),
	methods: {
		mapChange(data) {
			console.log(data);
		},
		rangeChange(data, name) {
			// console.log(data);
			// console.log(name);
			// do something like : this.filters[name] = data
		},
		userChange(data) {
			// value -> rien a voir avec le this.$emit
			// On recupere tout les index à filtrer 
			console.log(data);
		},
		timePickerChange(data) {
			console.log(data);
		}, 
		filter_all() {
			const filter_dset = [];
			const filt = [];
			this.index_filtered.map(x => {
				if (!filt.includes(x)) {
					filt.push(x);
				}
			});
			this.dataset.map((d, i) => {
				if (!filt.includes(i)){
					filter_dset.push(d);
				}
			});
		}
	}
};
</script>