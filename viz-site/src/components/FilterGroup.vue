<template>
	<v-card>
		<UserFilter :users="['User1', 'User2', 'User3']" />
	</v-card>
</template>
<script>
import UserFilter from '@/components/filters/UserFilter.vue';
import RangeSlider from '@/components/filters/RangeSlider.vue';
import MapFilter from '@/components/filters/MapFilter.vue';

export default {
	name: 'FilterGroup',
	components: {
		UserFilter
	},
	props: {
		filtersname: {
			default: null,
			type: Array
		}, 
		dataset: {
			default: null,
			type: Object
		}
	}
};

// class FilterGroup {
//     constructor(filtersname, range, users) {
//         this.filters = []
//         for (keyfilter in filtersname) {
//             if (keyfilter == 'UserFilter') {
//                 this.filters.add({
//                     "name": "UserFilter",
//                     "filter": new UserFilter(users, this)
//                 });
//             }
//             if (keyfilter == 'SequenceLengthSlider') {
//                 this.filters.add({
//                     "name": "UserFilter",
//                     "filter": new SequenceLengthFilter(users, this)
//                 });
//             }
//         }
//         /*this.sls = new SequenceLengthSlider(range, this);
//         this.sls.draw()
//         this.um = new UserMenu(users, this)
//         this.um.draw()*/
//     }

//     draw = () => {
//         for (f in this.filters) {
//             f.draw()
//         }
//     }
	
//     set_tree_ref = (ref) => {
//         this.tree_ref = ref
//     }

//     send_filters = () =>  {
//         this.value = []
//         for (f in this.filters) {
//             this.value.add(f.get_value())
//         }
//         this.tree_ref.update_filters(this.value)
//     }
// }
</script>