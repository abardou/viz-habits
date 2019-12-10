<template>
	<v-container>
		<v-row>
			<v-col cols="12" sm="3" md="3">
				<v-radio-group v-model="granularity" column>
					<v-radio
						label="Hourly"
						value="hourly"
					/>
					<v-radio
						label="Daily"
						value="daily"
					/>
					<v-radio
						label="Weekly"
						value="weekly"
					/>
				</v-radio-group>
			</v-col>
			<v-col cols="12" sm="9" md="9">
				<v-range-slider
					v-model="timeRange"
					:tick-labels="ticksLabels"
					thumb-label="always"
					:max="6"
					step="1"
					ticks
					tick-size="4"
				/>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	name: 'Timeline',
	data: () => ({
		granularity: 'hourly',
		timeRange: [2, 4],
		ticksLabels: [
			'12:00',
			'13:00',
			'14:00',
			'15:00',
			'16:00',
			'17:00',
			'18:00',
		],
	}),
};
</script>
