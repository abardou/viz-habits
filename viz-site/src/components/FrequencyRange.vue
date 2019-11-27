<template>
	<v-container>
		<v-row>
			<v-col cols="12" sm="12" md="12">
				<v-range-slider
					v-model="freqRange"
					thumb-label="always"
					:min="0"
					:max="1"
					step="0.01"
				/>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	name: 'Timeline',
	data: () => ({
		freqRange: [0.2, 0.65],
	}),
};
</script>
