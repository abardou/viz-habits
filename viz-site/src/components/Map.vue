<template>
	<v-container>
		<v-range-slider
			v-model="lat"
			:min="-180"
			:max="180"
			vertical
			step="0.01"
			thumb-label="always"
		/>
		<v-range-slider
			v-model="lng"
			:min="-180"
			:max="180"
			step="0.01"
			thumb-label="always"
		/>
		<div id="map" />
	</v-container>
</template>

<script>
import L from 'leaflet';

export default {
	name: 'Map',
	data: () => ({
		lat: [-30, 30],
		lng: [-30, 30]
	}),
	mounted: () => {
		// On initialise la latitude et la longitude de Paris (centre de la carte)
		var lat = 45.782569;
		var lon = 4.86673;
		var macarte = null;

		// Créer l'objet "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
		macarte = L.map('map').setView([lat, lon], 11);
		// Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
		L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
			// Il est toujours bien de laisser le lien vers la source des données
			attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
			minZoom: 1,
			maxZoom: 20
		}).addTo(macarte);
        
	}
};
</script>

<style scoped>
#map {
	height: 400px;
	width: 400p;
}
</style>
