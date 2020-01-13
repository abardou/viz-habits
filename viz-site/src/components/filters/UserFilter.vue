<template>
	<v-container>
		{{ label }}
		<v-checkbox
			v-model="selected"
			color="#f5f9f9"
			value="User1"
			default="checked"
			@change="changed"
		>
			<template v-slot:label>
				<div class="input-color">
					John Doe <span class="dot" style="background-color: #CC2A36; border: 1px solid #bbb" />
				</div>
			</template>
		</v-checkbox>

		<v-checkbox
			v-model="selected"
			color="#f5f9f9"
			value="User2"
			@change="changed"
		>
			<template v-slot:label>
				<div class="input-color">
					Richard Doe <span class="dot" style="background-color: #4F372D; border: 1px solid #bbb" />
				</div>
			</template>
		</v-checkbox>

		<v-checkbox
			v-model="selected"
			color="#f5f9f9"
			value="User3"
			@change="changed"
		>
			<template v-slot:label>
				<div class="input-color">
					Jane Doe <span class="dot" style="background-color: #00A0B0; border: 1px solid #bbb" />
				</div>
			</template>
		</v-checkbox>
	</v-container>
</template>

<script>
export default {
	name: 'UserFilter',
	data: () => ({
		selected: ['User1', 'User2', 'User3'],
		label: 'Utilisateurs'
	}),
	methods: {
		changed() {
			const toDel = [];
			const keep = []; 

			this.selected.forEach( x => {
				keep.push(parseInt(x.replace('User', '')));
			});

			for (const [i, d] of this.$store.state.data.entries()) {
				if (!keep.includes(d.User_ID)) {
					toDel.push(i);
				}
			}

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
