<template>
	<v-container>
		<v-progress-circular
			v-if="fetching"
			:size="60"
			color="red"
			indeterminate
		/>
		<div id="map" style="width: 1000px;height: 500px;" />
	</v-container>
</template>

<script>
import L from 'leaflet';
import * as d3 from 'd3';

export default {
	name: 'Map',
	data: () => ({
		fetching: true
	}),
	async mounted() {
		// const posData = await d3.csv('data/position.csv');
		this.fetching = false;

		const lat = 45.782569,
			lng = 4.86673;

		const map = new L.Map('map').setView([lat, lng], 7);
		const tileLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: 1,
			maxZoom: 20
		}).addTo(map);

		new L.svg().addTo(map);
		const overlay = d3.select(map.getPanes().overlayPane);
		const svg = overlay.select('svg');
		const dotsGroup = svg.append('g').attr('class', 'leaflet-zoom-hide');

		function projectPoint(x, y) {
			const point = map.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		}

		const projection = d3.geoTransform({point: projectPoint});
		const pathCreator = d3.geoPath().projection(projection);

		const posData = [{lat: 45.782569, lng: 4.86673}, {lat: 45.7828, lng: 4.8666}, {lat: 45.7826, lng: 4.8664}];
		for (const i in posData) {
			posData[i].xy = map.latLngToLayerPoint(new L.LatLng(posData[i].lat, posData[i].lng));
		}

		console.log(posData);
		console.log(svg);
		console.log(dotsGroup);
		// console.log(d3.select(map.getPanes().overlayPane).select('svg').append('g'));

		const featureDot = dotsGroup.select('.dot')
			.data(posData)
			.enter()
			.append('circle')
			.attrs({
				class: 'dot',
				id: d => `d${d.ID}`,
				cx: d => d.xy.x,
				cy: d => d.xy.y,
				r: 50,
				fill: 'red'		
			});
	}
};
</script>

<style>
#map {
	height: 400px;
	width: 400p;
}
</style>
