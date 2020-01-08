import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		data: null,
		timePickerSelection: {
			days: null,
			hours: null,
			minutes: null
		},
		usersSelection: [],
		draggingState: {
			dragging: false,
			dragStartRing: null
		}
	},
	mutations: {
		setTimePickerSelection(state, o) {
			state.timePickerSelection[o.key] = o.value;
		},
		setUsersSelection(state, value) {
			state.usersSelection = value;
		},
		setDraggingState(state, value) {
			state.draggingState = value;
		},
		setDataset(state, value) {
			state.data = value;
		},
		setFilteredDataset(state, value) {
			state.fdata = value;
		},
		setFinalDataset(state, value) {
			state.finaldata = value;
		}
	},
	actions: {
	},
	modules: {
	}
});
