<template>
	<v-container>
		{{ label }}
		<v-tooltip
			color="success"
			right
			max-width="200px"
		>
			<template v-slot:activator="{ on }">
				<help-icon class="icon-bigger" title="" v-on="on" />
			</template>
			<div>Filtre les applications provenant des utilisateurs décochés</div>
		</v-tooltip>
		<v-radio-group
			v-model="selected"
			@change="changed"
		>
			<v-radio 
				value="User1"
				default="checked"
			>
				<template v-slot:label>
					<div class="input-color">
						John Doe <span class="dot" style="background-color: #CC2A36; border: 1px solid #bbb" />
					</div>
				</template>
			</v-radio>
            
			<v-radio
				value="User2"
			>
				<template v-slot:label>
					<div class="input-color">
						Richard Doe <span class="dot" style="background-color: #4F372D; border: 1px solid #bbb" />
					</div>
				</template>
			</v-radio>

			<v-radio
				value="User3"
			>
				<template v-slot:label>
					<div class="input-color">
						Jane Doe <span class="dot" style="background-color: #00A0B0; border: 1px solid #bbb" />
					</div>
				</template>
			</v-radio>
		</v-radio-group>
	</v-container>
</template>

<script>
export default {
	name: 'RadialTreeUserFilter',
	data: () => ({
		selected: 'User1',
		label: 'Utilisateurs'
	}),
	methods: {
		changed() {
			const toDel = [];
			const keep = [];

			keep.push(parseInt(this.selected.replace('User', '')));

			for (const [i, d] of this.$store.state.dataRadial.entries()) {
				if (!keep.includes(d.User_ID)) {
					toDel.push(i);
				}
			}

			console.log(keep);

			this.$emit('userChange', toDel);
			this.$root.$emit('userChangeGlobal', keep);
		}
	}
};
</script>

<style>
    .dot {
        height: 15px;
        width: 15px;
        border-radius: 40%;
        position: relative;
        top: 2px;
        left: 2px;
        display: inline-block;
    }
</style>
