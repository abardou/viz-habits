<template>
	<v-app>
		<ul id="menu">
			<li data-menuanchor="page1" class="active">
				<a href="#page1">Section 1</a>
			</li>
			<li data-menuanchor="page2" class="">
				<a href="#page2">Section 2</a>
			</li>
			<li data-menuanchor="page3" class="">
				<a href="#page3">Section 3</a>
			</li>
		</ul>
		<v-content>
			<v-container fluid>
				<v-row v-if="fetched" dense>
					<v-col cols="5">
						<v-card>
							<FilterGroup @changeVisu="changeVisu" />	
						</v-card>
					</v-col>
					<v-col cols="7">
						<v-card>
							<ForceGraph v-if="visu" />
							<RadialTree v-else />
						</v-card>
					</v-col>
				</v-row>
				<v-container v-else style="text-align: center;">
					<v-progress-circular
						style="margin-top: 200px;"
						:size="200"
						:width="20"
						color="red"
						indeterminate
					/>
				</v-container>				
			</v-container>
		</v-content>
	</v-app>
</template>

<script>
// Filters
import FilterGroup from '@/components/FilterGroup.vue';
import ForceGraph from '@/components/visus/ForceGraph.vue';
import RadialTree from '@/components/visus/RadialTree.vue';

export default {
	name: 'Home',
	components: {
		FilterGroup,
		ForceGraph,
		RadialTree
	},
	data: () => ({
		fetched: false,
		// True: forceGraph False : dendogram
		visu: true
	}),
	mounted() {
		document.documentElement.addEventListener('mouseup', e => {
			this.$store.commit('setDraggingState', {
				dragging: false,
				dragStartRing: null,
				firstObject: null
			});
		});

		fetch('dataset.json').then(async resp => {
			let data = await resp.json();

			data = data.filter(d => d['App Name'] != 'Screen off' && !d['App Name'].startsWith('Screen on'));
			// const str = JSON.stringify(data);
			this.$store.commit('setDataset', data);
			this.$store.commit('setFilteredDataset', data);
			this.$store.commit('setFinalDataset', data);
			this.fetched = true;
		});
	},
	methods: {
		changeVisu(data) {
			this.visu = data;
		}
	}
};
</script>

<style>
#menu {
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 70;
	-webkit-font-smoothing: antialiased;
	-moz-font-smoothing: antialiased;
	letter-spacing: 1px;
	font-size: 1.1em;
	box-sizing: border-box;
}

ul {
	list-style: none;
	margin: 0;
	padding: 0;
}

#menu li {
	display: inline-block;
	margin: 10px 0;
	position: relative;
	padding: 0;
}

#menu li a {
	text-decoration: none;
	color:#fff;
	padding: 0 1.1em 1.1em 1.1em;
	font-family: arial,helvetica;
}


</style>
