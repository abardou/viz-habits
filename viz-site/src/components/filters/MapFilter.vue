<template>
	<v-container id="mapFilter-container" pb-0>
		<v-container class="d-inline-flex pa-0" outlined>
			<div>
				<div id="map" :style="{width: mapWidth + 'px'}" />
			</div>
		</v-container>
	</v-container>
</template>

<script>
import L from 'leaflet';
import selectAreaFeature from 'leaflet-selectareafeature';
import * as d3Base from 'd3';
import * as d3Slider from 'd3-simple-slider';

const d3 = Object.assign({}, d3Base, d3Slider);

export default {
	name: 'Map',
	data: () => ({
		latitudeRange: [0, 1],
		longitudeRange: [0, 1],
		map: null,
		minLat: null,
		maxLat: null,
		minLng: null,
		MaxLng: null,
		mapBounds: null,
		latLines: [null, null],
		lngLines: [null, null],
		veils: [null, null, null, null],
		mapWidth: null
	}),
	async mounted() {
		const filtersGroupContainerWidth = document.getElementById('mapFilter-container').parentNode.offsetWidth;
		this.mapWidth = filtersGroupContainerWidth - 50;
		const posData = await d3.json('dataset.json');

		const lat = 45.782569,
			lng = 4.86673;

		this.map = new L.Map('map', {preferCanvas: true}).setView([lat, lng], 7);
		const tileLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: 1,
			maxZoom: 20
		}).addTo(this.map);

		let colorScale = d3.scaleSequential().domain([1, 3]).interpolator(d3.interpolate('blue', 'red'));
		for (const i in posData) {
			const pd = posData[i];
			if (pd.Lat != undefined && pd.Long != undefined) {
				posData[i].latlng = new L.LatLng(pd.Lat, pd.Long);
				L.circle(pd.latlng, {
					color: colorScale(pd.User_ID),
					fillColor: colorScale(pd.User_ID),
					fillOpacity: 0.5,
					radius: 3
				})
					.addTo(this.map);
			}
		}

		const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.getMapBounds();

		this.selectFeature = this.map.selectAreaFeature.enable();
		this.selectFeature.options.color = '#05ac72';
		this.selectFeature.options.weight = 3;
		this.selectFeature.disable();

		this.buildCustomControl();
	},
	methods: {
		buildCustomControl() {
			const that = this;
			const lassoControl = L.Control.extend({
				options: {
					position: 'topright' 
				},
 
				onAdd(map) {
					that.container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom leaflet-control-lasso');
 
					that.container.style.backgroundColor = 'white';
					that.container.style.width = '35px';
					that.container.style.height = '35px';
					that.container.style.cursor = 'pointer';
 
					that.container.onclick = function() {
						if (that.selectFeature._enabled) {
							that.selectFeature.disable();
							that.container.style.backgroundColor = 'white';
						} else {
							that.selectFeature.enable();
							that.container.style.backgroundColor = '#D2E190';
						}
					};
					return that.container;
				}
			});

			this.map.addControl(new lassoControl());
		},
		sendEvent() {
			const toDel = [];
			
			for (const [i, d] of this.$store.state.data.entries()) {
				if (d.Lat == null || d.Long == null || d.Lat < this.minLat || d.Lat > this.maxLat || d.Long < this.minLng || d.Long > this.maxLng) {
					toDel.push(i);
				}
			}

			this.$emit('mapChange', toDel);
		},
		computeNewMinMax() {
			this.mapBounds = this.getMapBounds();
			const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.mapBounds;

			const minLatSlider = this.latitudeRange[0],
				maxLatSlider = this.latitudeRange[1];

			this.minLat = this.intervalShift(minLatSlider, 0, 1, minLatMap, maxLatMap);
			this.maxLat = this.intervalShift(maxLatSlider, 0, 1, minLatMap, maxLatMap);

			const minLngSlider = this.longitudeRange[0],
				maxLngSlider = this.longitudeRange[1];

			this.minLng = this.intervalShift(minLngSlider, 0, 1, minLngMap, maxLngMap);
			this.maxLng = this.intervalShift(maxLngSlider, 0, 1, minLngMap, maxLngMap);

		},
		getMapBounds() {
			const bounds = this.map.getBounds();

			const minLatMap = bounds._southWest.lat,
				maxLatMap = bounds._northEast.lat,
				minLngMap = bounds._southWest.lng,
				maxLngMap = bounds._northEast.lng;
			
			return [minLatMap, maxLatMap, minLngMap, maxLngMap];
		},
		intervalShift(x, a, b, c, d) {
			return c + ((d - c) / (b - a)) * (x - a);
		}
	}
};
</script>

<style>
#map {
	height: 358px;
}

.leaflet-control-lasso {
	background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsSAAALEgHS3X78AAAD6UlEQVR4nO1b7XHbMAwFfP0fdYKqE8QbRJ0gGUEjaAR3A4/gbuBOUHWCKhs4E1SegD06jzmYpWhJpiRKNu58Tix+AA8gCQIQK6Xolml109LfAbgDcAfg5gH4NPQEzJwSkf4kRLR2NKmJqNLfSqlqaH7+4y/0McjML0SUQdinHkO8ApCSiPZKqToogxYFAQBC50T03NDkN74raFzSGtahreSLo+9PALG7mlEXaQD6fMD0BgIp8TkQ0ZaINChpl7ExZoZxK2vcGr8nfXl2ztm5g1twI/Q6KHPvVlFg/DMgJgEAWpWCay3lIYX2zJ1bQFQhAO+i9b2l8VEEd/BSWEooBgUAm5REPvg67AGCrZDdIABgQ6qF1oOu8QBAbK4FwTd4bq23SbXeks/OIPg0f7V5TQRCpz3BNdhamH30wgu+CwFC66VqD5IIByRas/eAYDbGqi8AW+FszEp4ocC6y1KQneW6z+YmvJDDLIVDVwBKdNzPVXghi/FbLjprp4AIM2fi6loMcusal8zN8eXirOp885jNrn/BAlKxnL17GWPj+As8viqlDguwAG3V+hR7JKJvSqmyqd1KmMnrUoQHGaEzX6OVaLAfg6sRyUSeUt+UKxGobDSTmZKR5yIAj/h79IhsDPSRFxg6+ho9AAukpI1IgydGxiY4dSRON+/SXgwAyE1sHbkF79JmeEuaPs91H4DWf+Ffk1nSgDwQ0RH5iUbZqgXcAI0MG/FbKn7f+i5DZo14PabISR/lb0qpjWETXq252LmSsidaCYfh8s0pbnKZuFHuEzNvmNl5MiR9YmmRLYHaxb8VJ3SG+UzD3ZyvwyI/UEPozMoZFE2xTjOADId1yuhGBMLO0raSUSE74HsGgDoPiZULsIISPkFqtUlEuOx0YsiHadeIakTC57bGPW0zAVRiP+yVXJhY+M6JHLFcCtfDvUAoahCseoXW0Wz0Oy1310O5WUQLgmX2ZddEzkffhoc2CJMUQ3h4kzt+v7S4ke/CRKWYaBtBYURmF2tcMda7bC0absWEk5TG4ISyS3Suury1BqAB+XIMIDCv7eAEsUTvHtDQoak8bhPSexSlcXadYBlqHu8p0BMIZRVIti9QeD/Hc/S1hVawgKDuufQDriqVZeYcAjeVyL4BGBc1lcaSKY8dolaYmTXgf0ykKFStcCIKpM33Q8vuR1EcXeEuMkhoDnyWCKB81wGUQV+aEhFaJ/mSlgPwYvyHZ8QN9SlS38RbY3hnYQ/NHyH8KVq0+DdGdCgMS+sRe1ImX8xYvAUw8wGb7Q9c88/2l1sAIEPBlPM0ur85GgEPk9IdgAh4mJTuAETAw3RERP8Ab2Uzgrad13wAAAAASUVORK5CYII=');
	background-size: 28px;
	background-repeat: no-repeat;
	background-position: left 2px top 2px;
}
</style>
