import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		data: null,
		fdata: null,
		finaldata: null,
		dataRadial: null,
		fdataRadial: null,
		finaldataRadial: null,
		usersSelection: [],
		draggingState: {
			dragging: false,
			dragStartRing: null
		}
	},
	mutations: {
		setDraggingState(state, value) {
			state.draggingState = value;
		},
		setDataset(state, value) {
			state.data = Object.freeze(value);
		},
		setFilteredDataset(state, value) {
			state.fdata = Object.freeze(value);
		},
		setFinalDataset(state, value) {
			state.finaldata = Object.freeze(value);
		},
		setDatasetRadial(state, value) {
			state.dataRadial = Object.freeze(value);
		},
		setFilteredDatasetRadial(state, value) {
			state.fdataRadial = Object.freeze(value);
		},
		setFinalDatasetRadial(state, value) {
			state.finaldataRadial = Object.freeze(value);
		}
	},
	actions: {
	},
	modules: {
	}
});
