<template>
	<v-container id="mapFilter-container" pa-0>
		{{ label }}
		<v-tooltip color="success" right max-width="200px">
			<template v-slot:activator="{ on }">
				<help-icon class="icon-bigger" title="" v-on="on" />
			</template>
			<div>
				Permet via l'utilisation de l'outil lasso de dessiner des zones restreignant la position où les applications ont été utilisées
			</div>
		</v-tooltip> 
		<v-container class="d-inline-flex pa-0" outlined>
			<div>
				<div id="map" :style="{width: mapWidth + 'px'}" />
			</div>
			<v-container grid-list-xs pr-0 style="text-align: center">
				<v-btn style="color: #252835;" color="#f5f9f9" @click="clearLast">
					Clear last
				</v-btn>
				<br>
				<br>
				<v-btn style="color: #252835;" color="#f5f9f9" @click="clearAll">
					Clear all
				</v-btn>
			</v-container>
		</v-container>
	</v-container>
</template>

<script>
import L from 'leaflet';
// import selectAreaFeature from 'leaflet-selectareafeature';
import selectAreaFeature from '@/utils/Leaflet.SelectAreaFeature';
L.Map.addInitHook('addHandler', 'selectAreaFeature', L.SelectAreaFeature);
import * as d3 from 'd3';

export default {
	name: 'Map',
	data: () => ({
		latitudeRange: [0, 1],
		longitudeRange: [0, 1],
		mapWidth: null,
		label: 'Données géographiques'
	}),
	// myProperties: {
	// 	map	: null,
	// },
	async mounted() {
		this.toKeep = [];
		this.toDel = [];
		this.pointsWithLatLng = [];
		this.circles = [];
		
		const filtersGroupContainerWidth = document.getElementById('mapFilter-container').parentNode.offsetWidth;
		this.mapWidth = filtersGroupContainerWidth - 150;

		this.posData = JSON.parse(JSON.stringify(this.$store.state.data));

		const lat = 45.782569,
			lng = 4.86673;

		this.map = new L.Map('map', {preferCanvas: true}).setView([lat, lng], 7);
		const tileLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: 1,
			maxZoom: 20
		}).addTo(this.map);

		this.colorScale = ['#CC2A36', '#4F372D', '#00A0B0'];
		
		for (const [i, pd] of this.posData.entries()) {
			if (pd.Lat != undefined && pd.Long != undefined) {
				this.posData[i].latlng = new L.LatLng(pd.Lat, pd.Long);
				const cs = this.colorScale;
				
				this.circles.push(
					L.circle(pd.latlng, {
						color: cs[pd.User_ID-1],
						radius: 3
					})
						.addTo(this.map)
				);
			}
		}

		for (const [line_idx, d] of this.$store.state.data.entries()) {
			// Par défaut tous les points sont dans toDel
			this.toDel.push(line_idx);

			// On crée ce tableau pour éviter de boucler sur des points qui seront de toutes manière exclus
			if (d.Lat != null && d.Long != null) {
				this.pointsWithLatLng.push(line_idx);
			}
		}

		this.selectFeature = this.map.selectAreaFeature.enable();
		this.selectFeature.options.color = '#05ac72';
		this.selectFeature.options.weight = 3;
		this.selectFeature.disable();

		this.buildCustomControl();
		this.map.on('DrewArea', () => this.sendEvent(true));
		this.$root.$on('userChangeGlobal', (users) => this.redrawUserPoints(users));
	},
	methods: {
		redrawUserPoints(users) {
			for (const circle of this.circles) {
				this.map.removeLayer(circle);
			}
			this.circles = [];

			for (const [i, pd] of this.posData.entries()) {
				if (pd.Lat != undefined && pd.Long != undefined && users.includes(pd.User_ID)) {
					const cs = this.colorScale;

					this.circles.push(
						L.circle(pd.latlng, {
							color: cs[pd.User_ID-1],
							radius: 3
						})
							.addTo(this.map)
					);
				}
			}

		},
		buildCustomControl() {
			const that = this;
			const lassoControl = L.Control.extend({
				options: {
					position: 'topright' 
				},
 
				onAdd(map) {
					const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom leaflet-control-lasso');
					L.DomEvent.disableClickPropagation(container);

					container.style.backgroundColor = 'white';
					container.style.width = '35px';
					container.style.height = '35px';
					container.style.cursor = 'pointer';
 
					container.onclick = function() {
						if (that.selectFeature._enabled) {
							that.selectFeature.disable();
							container.style.backgroundColor = 'white';
						} else {
							that.selectFeature.enable();
							container.style.backgroundColor = '#D2E190';
						}
					};
					return container;
				}
			});

			this.map.addControl(new lassoControl());
		},
		clearLast() {
			const removed = this.selectFeature.removeLastArea();
			if (removed) {
				this.toKeep.pop();
				this.sendEvent(false);
			}
		},
		clearAll() {
			const removed = this.selectFeature.removeAllArea();
			if (removed) {
				this.toKeep = [];
				this.sendEvent(false);
			}
		},
		sendEvent(newArea) {
			if (newArea) {
				const newtoKeep = [];
				const area = JSON.parse(JSON.stringify(this.selectFeature.getAreaLatLng()));
				const data = this.$store.state.data;
				
				const nvert = area.length;

				for (const line_idx of this.pointsWithLatLng) {
					// lat = y, lng = x
					let i = 0,
						j = 0,
						c = false;

					for (i = 0, j = nvert-1; i < nvert; j = i++) {
						if ( ((area[i].lat > data[line_idx].Lat) != (area[j].lat>data[line_idx].Lat))
								&& (data[line_idx].Long < (area[j].lng - area[i].lng) * (data[line_idx].Lat-area[i].lat) / (area[j].lat-area[i].lat) + area[i].lng)
						) {
							c = !c;
						}
					}

					if (c) newtoKeep.push(line_idx);
				}

				this.toKeep.push(newtoKeep);
			}
			let diff = [];
			if (this.toKeep.length > 0) {
				const toDel = JSON.parse(JSON.stringify(this.toDel));
				const allToKeep = Array.from(new Set(this.toKeep.flat()));
				diff = toDel.filter(x => !allToKeep.includes(x));
			}
			
			this.$emit('mapChange', diff);
		}
	}
};
</script>

<style>
#map {
	height: 339px;
}

.leaflet-control-lasso {
	background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsSAAALEgHS3X78AAAD6UlEQVR4nO1b7XHbMAwFfP0fdYKqE8QbRJ0gGUEjaAR3A4/gbuBOUHWCKhs4E1SegD06jzmYpWhJpiRKNu58Tix+AA8gCQIQK6Xolml109LfAbgDcAfg5gH4NPQEzJwSkf4kRLR2NKmJqNLfSqlqaH7+4y/0McjML0SUQdinHkO8ApCSiPZKqToogxYFAQBC50T03NDkN74raFzSGtahreSLo+9PALG7mlEXaQD6fMD0BgIp8TkQ0ZaINChpl7ExZoZxK2vcGr8nfXl2ztm5g1twI/Q6KHPvVlFg/DMgJgEAWpWCay3lIYX2zJ1bQFQhAO+i9b2l8VEEd/BSWEooBgUAm5REPvg67AGCrZDdIABgQ6qF1oOu8QBAbK4FwTd4bq23SbXeks/OIPg0f7V5TQRCpz3BNdhamH30wgu+CwFC66VqD5IIByRas/eAYDbGqi8AW+FszEp4ocC6y1KQneW6z+YmvJDDLIVDVwBKdNzPVXghi/FbLjprp4AIM2fi6loMcusal8zN8eXirOp885jNrn/BAlKxnL17GWPj+As8viqlDguwAG3V+hR7JKJvSqmyqd1KmMnrUoQHGaEzX6OVaLAfg6sRyUSeUt+UKxGobDSTmZKR5yIAj/h79IhsDPSRFxg6+ho9AAukpI1IgydGxiY4dSRON+/SXgwAyE1sHbkF79JmeEuaPs91H4DWf+Ffk1nSgDwQ0RH5iUbZqgXcAI0MG/FbKn7f+i5DZo14PabISR/lb0qpjWETXq252LmSsidaCYfh8s0pbnKZuFHuEzNvmNl5MiR9YmmRLYHaxb8VJ3SG+UzD3ZyvwyI/UEPozMoZFE2xTjOADId1yuhGBMLO0raSUSE74HsGgDoPiZULsIISPkFqtUlEuOx0YsiHadeIakTC57bGPW0zAVRiP+yVXJhY+M6JHLFcCtfDvUAoahCseoXW0Wz0Oy1310O5WUQLgmX2ZddEzkffhoc2CJMUQ3h4kzt+v7S4ke/CRKWYaBtBYURmF2tcMda7bC0absWEk5TG4ISyS3Suury1BqAB+XIMIDCv7eAEsUTvHtDQoak8bhPSexSlcXadYBlqHu8p0BMIZRVIti9QeD/Hc/S1hVawgKDuufQDriqVZeYcAjeVyL4BGBc1lcaSKY8dolaYmTXgf0ykKFStcCIKpM33Q8vuR1EcXeEuMkhoDnyWCKB81wGUQV+aEhFaJ/mSlgPwYvyHZ8QN9SlS38RbY3hnYQ/NHyH8KVq0+DdGdCgMS+sRe1ImX8xYvAUw8wGb7Q9c88/2l1sAIEPBlPM0ur85GgEPk9IdgAh4mJTuAETAw3RERP8Ab2Uzgrad13wAAAAASUVORK5CYII=');
	background-size: 28px;
	background-repeat: no-repeat;
	background-position: left 2px top 2px;
}
</style>
