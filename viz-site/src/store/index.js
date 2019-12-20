import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
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
		}
	},
	actions: {
	},
	modules: {
	}
});
