<template>
	<v-container id="mapFilter-container" pb-0>
		<v-container class="d-inline-flex pa-0" outlined>
			<div style="width: 20px">
				<v-range-slider
					v-model="latitudeRange"
					:min="0"
					:max="1"
					:step="0.001"
					vertical
					class="latitude-slider"
					@input="onVerSlider"
				/>
			</div>
			<div>
				<div id="map" :style="{width: mapWidth + 'px'}" />
			</div>
		</v-container>
		<v-container class="d-inline-flex pa-0" outlined>
			<div style="width: 20px" />
			<div>
				<v-range-slider 
					v-model="longitudeRange"
					:min="0"
					:max="1"
					:step="0.001"
					class="large-slider-hor"
					:style="{width: mapWidth + 'px'}"
					@input="onHorSlider"
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

		this.veils[0] = this.makeVeil({lat: minLatMap, lng: minLngMap}, {lat: maxLatMap, lng: minLngMap});
		this.veils[1] = this.makeVeil({lat: minLatMap, lng: minLngMap}, {lat: minLatMap, lng: maxLngMap});
		this.veils[2] = this.makeVeil({lat: minLatMap, lng: maxLngMap}, {lat: maxLatMap, lng: maxLngMap});
		this.veils[3] = this.makeVeil({lat: maxLatMap, lng: minLngMap}, {lat: maxLatMap, lng: maxLngMap});
		this.latLines[0] = this.makePolyline({lat: minLatMap, lng: minLngMap}, {lat: minLatMap, lng: maxLngMap});
		this.latLines[1] = this.makePolyline({lat: maxLatMap, lng: minLngMap}, {lat: maxLatMap, lng: maxLngMap});
		this.lngLines[0] = this.makePolyline({lat: minLatMap, lng: minLngMap}, {lat: maxLatMap, lng: minLngMap});
		this.lngLines[1] = this.makePolyline({lat: minLatMap, lng: maxLngMap}, {lat: maxLatMap, lng: maxLngMap});

		this.map.on('move', () => {
			this.computeNewMinMax();
			this.drawHorLines();
			this.drawVerLines();
			this.drawVeils();
			this.sendEvent();
		});
	},
	methods: {
		onHorSlider() {
			this.computeNewMinMax();
			this.drawVerLines();
			this.drawVeils();
			this.sendEvent();
		},
		onVerSlider() {
			this.computeNewMinMax();
			this.drawHorLines();
			this.drawVeils();
			this.sendEvent();
		},
		sendEvent() {
			const that = this;
			const data = {
				minLat: that.minLat,
				maxLat: that.maxLat,
				minLng: that.minLng,
				maxLng: that.maxLng,
			};
			
			this.$emit('mapChange', data);
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
		drawHorLines() {
			// Clear les anciennes lignes
			for (const marker of this.latLines) {
				this.map.removeLayer(marker);
			}

			const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.mapBounds;
			const that = this;
			
			this.latLines[0] = this.makePolyline({lat: that.minLat, lng: minLngMap}, {lat: that.minLat, lng: maxLngMap});
			this.latLines[1] = this.makePolyline({lat: that.maxLat, lng: minLngMap}, {lat: that.maxLat, lng: maxLngMap});
		},
		drawVerLines() {
			// Clear les anciennes lignes
			for (const marker of this.lngLines) {
				this.map.removeLayer(marker);
			}

			const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.mapBounds;
			const that = this;

			this.lngLines[0] = this.makePolyline({lat: minLatMap, lng: that.minLng}, {lat: maxLatMap, lng: that.minLng});
			this.lngLines[1] = this.makePolyline({lat: minLatMap, lng: that.maxLng}, {lat: maxLatMap, lng: that.maxLng});
		},
		drawVeils() {
			// Clear les anciens voiles
			for (const marker of this.veils) {
				this.map.removeLayer(marker);
			}

			const [minLatMap, maxLatMap, minLngMap, maxLngMap] = this.mapBounds;
			const that = this;

			this.veils[0] = this.makeVeil({lat: minLatMap, lng: minLngMap}, {lat: maxLatMap, lng: that.minLng});
			this.veils[1] = this.makeVeil({lat: minLatMap, lng: that.minLng}, {lat: that.minLat, lng: that.maxLng});
			this.veils[2] = this.makeVeil({lat: minLatMap, lng: that.maxLng}, {lat: maxLatMap, lng: maxLngMap});
			this.veils[3] = this.makeVeil({lat: that.maxLat, lng: that.minLng}, {lat: maxLatMap, lng: that.maxLng});
		},
		intervalShift(x, a, b, c, d) {
			return c + ((d - c) / (b - a)) * (x - a);
		},
		makePolyline(pt1, pt2) {
			return L.polyline([
				[pt1.lat, pt1.lng],
				[pt2.lat, pt2.lng],
			], {
				color: 'black',
				weight: 2,
				opacity: 0.9,
				//dashArray: '20'
			}).addTo(this.map);
		},
		makeVeil(pul, pbr) {
			return L.rectangle([
				[pul.lat, pul.lng],
				[pbr.lat, pbr.lng]
			], {
				color: 'black',
				weight: 1
			}).addTo(this.map);
		}
	}
};
</script>

<style>
#map {
	height: 358px;
}

.latitude-slider .v-slider {
  height: 358px;
	margin-top: 0px;
	margin-bottom: 0px;
}

.large-slider-hor .v-slider {
	margin-left: 0px;
	margin-right: 0px;
}
</style>
