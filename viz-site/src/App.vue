<template>
	<v-app>
		<v-content id="mainContent">
			<full-page id="fullpage" ref="fullpage" :options="options">
				<v-container
					id="firstPage"
					class="section"
					fluid
					data-anchor="vitrine"
				>
					<v-alert v-if="notChromeOrFirefox" type="warning">
						Développement effecuté sous Firefox, vérifié sur Chrome. Préférez utiliser un de ces deux navigateurs.
					</v-alert>
					<h1>
						Visualisation des habitudes de consommation des smartphones
					</h1>
					<div style="text-align: center; margin-top: 7%; font-size: 1.3em">
						Anthony Bardou, Hugo Polloli, Tristan Syrzisko et Théo Rabut
					</div>
					<div
						style="text-align: center; position: absolute; bottom: 7%; width: 100%"
					>
						<v-btn
							color="#f5f9f9"
							style="color: #252835;"
							@click="$refs.fullpage.api.moveSectionDown()"
						>
							Next
						</v-btn>
					</div>
				</v-container>
				<v-container
					class="section"
					fluid
					data-anchor="explications"
				>
					<v-row>
						<v-col cols="7" style="text-align: center; margin: auto; padding: 0 3%; margin-bottom: 3%;">
							<h2 style="text-transform: uppercase">
								Contexte
							</h2>
							<p>Le smartphone est une technologie qui s'est ancrée profondément dans nos sociétés développées. Outil permettant de naviguer parmi un grand ensemble d'applications, nous l'utilisons plusieurs fois par jour, chacun à notre manière. Dans ce projet, nous avons voulu représenter les profils, les façons dont les différents utilisateurs naviguent dans leur téléphone. Cette visualisation, qui s'inscrit dans le contexte de l'explosion des flux de données et du <em>Quantified Self</em>, permet à un utilisateur curieux comme à un expert cherchant à visualiser des comportements d'explorer différents profils de consommation selon différents critères comme la période temporelle, la localisation ou encore le temps d'utilisation de chaque application.</p>
						</v-col>
					</v-row>
					<v-row>
						<v-col cols="6" style="text-align: center; padding: 0 3%">
							<h2 style="text-transform: uppercase">
								Collection des données
							</h2>
							<p>Les données que nous utilisons ont été collectées par nos soins, sur nous-mêmes, grâce à l'application App Usage. Elle permet un export de l'activité de l'utilisateur du téléphone sur lequel elle est installée. En croisant ces données avec nos historiques des positions (collectés et fournis par Google), nous pouvons alors constituer un dataset en JSON liant temps d'utilisation des applications, positions géographiques et temporelles.</p>
						</v-col>
						<v-col cols="6" style="text-align: center; padding: 0 3%">
							<h2 style="text-transform: uppercase">
								Visualisation
							</h2>
							<p>Les données sont représentées par un graphe, dans lequel les noeuds incarnent les applications (dont la taille varie en fonction de leur temps d'utilisation). Deux noeuds sont liés si l'utilisateur est passé d'une application à l'autre (la largeur des arêtes représentant le nombre de fois que l'utilisateur a effectué ce basculement). En jouant avec les filtres liés à la visualisation, on peut se rendre compte de plusieurs types de consommation différentes, en fonction du lieu et de l'heure de la journée.</p>
						</v-col>
					</v-row>
					<div
						style="text-align: center; position: absolute; bottom: 7%; width: 100%"
					>
						<v-btn
							color="#f5f9f9"
							style="color: #252835;"
							@click="$refs.fullpage.api.moveSectionDown()"
						>
							Voir la visualisation
						</v-btn>
					</div>
				</v-container>
				<v-container
					class="section"
					fluid
					data-anchor="visualisation"
					pt-1
				>
					<v-row v-if="fetched" dense>
						<v-col cols="5">
							<!-- <v-card style="background-color: #2B2B3B"> -->
							<FilterGroup v-if="visu" @changeVisu="changeVisu" />
							<FilterGroupRadial v-else @changeVisu="changeVisu" />
							<!-- </v-card> -->
						</v-col>
						<v-col cols="7">
							<!-- <v-card> -->
							<ForceGraph v-if="visu" />
							<RadialTree v-else />
							<!-- </v-card> -->
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
			</full-page>
		</v-content>
	</v-app>
</template>

<script>
// Filters
import FilterGroupRadial from '@/components/FilterGroupRadial.vue';
import FilterGroup from '@/components/FilterGroup.vue';
import ForceGraph from '@/components/visus/ForceGraph.vue';
import RadialTree from '@/components/visus/RadialTree.vue';


export default {
	name: 'Home',
	components: {
		FilterGroup,
		FilterGroupRadial,
		ForceGraph,
		RadialTree
	},
	data: () => ({
		fetched: false,
		// True: forceGraph False : dendogram
		visu: true,
		notChromeOrFirefox: false,
		options: {
			licenseKey: 'vhs@RA^t1',
			anchors: ['vitrine', 'explications', 'visualisation'],
			sectionsColor: ['#252835', '#252835', '#252835'],
			navigation: true,
			navigationPosition: 'right',
			navigationTooltips: ['Première Page', 'Explications', 'Visualisation']
			// loopTop: true,
			// loopBottom: true
		}
	}),
	mounted() {
		document.documentElement.addEventListener('mouseup', e => {
			this.$store.commit('setDraggingState', {
				dragging: false,
				dragStartRing: null,
				firstObject: null
			});
		});

		const uA = navigator.userAgent;

		if (uA.indexOf('Firefox') == -1 && uA.indexOf('Chrome') == -1) {
			this.notChromeOrFirefox = true;
		}

		fetch('dataset.json').then(async resp => {
			let data = await resp.json();

			this.$store.commit('setBrutDataset', data);

			if (this.visu) {
				data = data.filter(d => d['App Name'] != 'Screen off' && !d['App Name'].startsWith('Screen on'));
				this.$store.commit('setDataset', data);
				this.$store.commit('setFilteredDataset', data);
				this.$store.commit('setFinalDataset', data);
				// const str = JSON.stringify(data);
			} else {
				this.$store.commit('setDataset', data);
				this.$store.commit('setFilteredDataset', data);
				this.$store.commit('setFinalDataset', data);

			}

			this.fetched = true;
		});
	},
	methods: {
		changeVisu(val) {
			this.visu = val;

			let data = this.$store.state.brutData;

			if (val) {
				data = data.filter(d => d['App Name'] != 'Screen off' && !d['App Name'].startsWith('Screen on'));
				this.$store.commit('setDataset', data);
				this.$store.commit('setFilteredDataset', data);
				this.$store.commit('setFinalDataset', data);
			} else {
				this.$store.commit('setDataset', data);
				this.$store.commit('setFilteredDataset', data);
				this.$store.commit('setFinalDataset', data);
			}
		}
	}
};
</script>

<style>
@font-face {
	font-family: 'Biko Regular';
	src: url('~@/assets/Biko_Regular.otf');
	font-weight: normal;
	font-style: normal;
}

.section {
	font-family: 'Biko Regular'
}

h1 {
	font-size: 5em;
	margin-left: 15%;
	margin-right: 15%;
	text-align: center;
	font-weight: normal;
}

h2 {
	font-size: 2em;
	margin-bottom: 15px;
	font-weight: normal;
}

h2:after
{
	content:' ';
	display:block;
	width: 200px;
	margin: auto;
	border: 1px solid #4CAF50;
}

p {
	font-size: 1.1em;
}

#fp-nav ul li a span {
	background-color: white !important;
}

#firstPage {
	padding: 0;
	/* The image used */
  background-image: url("~@/assets/home_bg.svg");

  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.help-circle-outline-icon {
	cursor: pointer;
}

.material-design-icon.icon-bigger {
  height: 1.5em;
  width: 1.5em;
}
 
.material-design-icon.icon-bigger > .material-design-icon__svg {
  height: 1.5em;
  width: 1.5em;
}
</style>
