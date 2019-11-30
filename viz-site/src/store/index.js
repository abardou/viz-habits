import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		daysSelection: null,
		hoursSelection: null,
		minutesSelection: null,
		timePickerDragingState: null
	},
	mutations: {
		setDaysSelection(state, value) {
			state.daysSelection = value;
		},
		setHoursSelection(state, value) {
			state.hoursSelection = value;
		},
		setMinutesSelection(state, value) {
			state.minutesSelection = value;
		},
		setTimePickerDragingState(state, value) {
			state.timePickerDragingState = value;
		}
	},
	actions: {
	},
	modules: {
	}
});
