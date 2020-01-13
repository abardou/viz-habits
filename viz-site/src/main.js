import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import VueFullPage from 'vue-fullpage.js';
import 'vue-material-design-icons/styles.css';

import HelpCircleOutline from 'vue-material-design-icons/HelpCircleOutline.vue';
 
Vue.component('help-icon', HelpCircleOutline);

Vue.use(VueFullPage);

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	vuetify,
	render: h => h(App)
}).$mount('#app');
