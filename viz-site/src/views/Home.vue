<template>
	<div class="home">
		<v-container grid-list-xs>
			<v-card>
				<Timeline />
				<FrequencyRange />
			</v-card>
		</v-container>
	</div>
</template>

<script>
// @ is an alias to /src
import Timeline from '@/components/Timeline.vue';
import FrequencyRange from '@/components/FrequencyRange.vue';

export default {
	name: 'Home',
	components: {
		Timeline,
		FrequencyRange
	}
};
</script>
