<template>
	<v-container>
		<v-container class="d-inline-flex pa-2" outlined>
			<div style="width: 20px">
				<v-range-slider
					v-model="latitudeRange"
					:min="0"
					:max="1"
					:step="0.001"
					vertical
					class="latitude-slider"
					@input="drawHorLines"
				/>
			</div>
			<div>
				<div id="map" />
			</div>
		</v-container>
		<v-container class="d-inline-flex pa-2" outlined>
			<div style="width: 20px" />
			<div>
				<v-range-slider 
					v-model="longitudeRange"
					:min="0"
					:max="1"
					:step="0.001"
					class="large-slider-hor"
					@input="drawVerLines"
				/>
			</div>
		</v-container>
	</v-container>
</template>

<script>
import L from 'leaflet';
import * as d3Base from 'd3';
import * as d3Slider from 'd3-simple-slider';

const d3 = Object.assign({}, d3Base, d3Slider);

export default {
	name: 'Map',
	data: () => ({
		latitudeRange: [0, 1],
		longitudeRange: [0, 1],
		map: null,
		latLines: [null, null],
		lngLines: [null, null]
	}),
	async mounted() {
		const posData = await d3.csv('data/position.csv');

		const lat = 45.782569,
			lng = 4.86673;

		this.map = new L.Map('map').setView([lat, lng], 7);
		const tileLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: 1,
			maxZoom: 20
		}).addTo(this.map);

		for (const i in posData) {
			const pd = posData[i];
			if (pd.Lat != undefined && pd.Long != undefined) {
				posData[i].latlng = new L.LatLng(pd.Lat, pd.Long);
				if (Math.random() < 0.05) {
					L.circle(pd.latlng, {
						color: 'red',
						fillColor: 'red',
						fillOpacity: 0.5,
						radius: 5
					})
						.addTo(this.map);
				}
			}
		}

		const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.getMapBounds();

		this.latLines[0] = this.makePolyline({lat: minLatMap, lng: minLngMap}, {lat: minLatMap, lng: maxLngMap});
		this.latLines[1] = this.makePolyline({lat: maxLatMap, lng: minLngMap}, {lat: maxLatMap, lng: maxLngMap});
		this.lngLines[0] = this.makePolyline({lat: minLatMap, lng: minLngMap}, {lat: maxLatMap, lng: minLngMap});
		this.lngLines[1] = this.makePolyline({lat: minLatMap, lng: maxLngMap}, {lat: maxLatMap, lng: maxLngMap});

		this.map.on('move', () => {
			this.drawHorLines();
			this.drawVerLines();
		});
	},
	methods: {
		getMapBounds() {
			const bounds = this.map.getBounds();

			const minLatMap = bounds._southWest.lat,
				maxLatMap = bounds._northEast.lat,
				minLngMap = bounds._southWest.lng,
				maxLngMap = bounds._northEast.lng;
			
			return [minLatMap, maxLatMap, minLngMap, maxLngMap];
		},
		drawHorLines() {
			// Clear les anciennes lignes
			for (const marker of this.latLines) {
				this.map.removeLayer(marker);
			}

			const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.getMapBounds();

			const minLatSlider = this.latitudeRange[0],
				maxLatSlider = this.latitudeRange[1];

			const newMinLat = this.intervalShift(minLatSlider, 0, 1, minLatMap, maxLatMap),
				newMaxLat = this.intervalShift(maxLatSlider, 0, 1, minLatMap, maxLatMap);
			
			this.latLines[0] = this.makePolyline({lat: newMinLat, lng: minLngMap}, {lat: newMinLat, lng: maxLngMap});
			this.latLines[1] = this.makePolyline({lat: newMaxLat, lng: minLngMap}, {lat: newMaxLat, lng: maxLngMap});
		},
		drawVerLines() {
			// Clear les anciennes lignes
			for (const marker of this.lngLines) {
				this.map.removeLayer(marker);
			}

			const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.getMapBounds();

			const minLngSlider = this.longitudeRange[0],
				maxLngSlider = this.longitudeRange[1];

			const newMinLng = this.intervalShift(minLngSlider, 0, 1, minLngMap, maxLngMap),
				newMaxLng = this.intervalShift(maxLngSlider, 0, 1, minLngMap, maxLngMap);

			this.lngLines[0] = this.makePolyline({lat: minLatMap, lng: newMinLng}, {lat: maxLatMap, lng: newMinLng});
			this.lngLines[1] = this.makePolyline({lat: minLatMap, lng: newMaxLng}, {lat: maxLatMap, lng: newMaxLng});
		},
		intervalShift(x, a, b, c, d) {
			return c + ((d - c) / (b - a)) * (x - a);
		},
		makePolyline(pt1, pt2) {
			return L.polyline([
				[pt1.lat, pt1.lng],
				[pt2.lat, pt2.lng],
			], {
				color: 'green',
				weight: 5,
				opacity: 0.9,
				dashArray: '20'
			}).addTo(this.map);
		}
	}
};
</script>

<style>
#map {
	width: 1000px;
	height: 500px;
}

.latitude-slider .v-slider {
  height: 500px;
	margin-top: 0px;
	margin-bottom: 0px;
}

.large-slider-hor .v-slider {
  width: 1000px;
	margin-left: 0px;
	margin-right: 0px;
}
</style>
