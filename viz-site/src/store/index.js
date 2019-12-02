import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		daysSelection: null,
		hoursSelection: null,
		minutesSelection: null,
		draggingState: {
			dragging: false,
			dragStartRing: null
		}
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
		setDraggingState(state, value) {
			state.draggingState = value;
		}
	},
	actions: {
	},
	modules: {
	}
});
