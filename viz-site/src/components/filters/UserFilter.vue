<template>
	<v-container>
		{{ label }}
		<v-checkbox
			v-model="selected"
			value="User1"
			default="checked"
			@change="changed"
		>
			<template v-slot:label>
				<div class="input-color">
					John Doe <span class="dot" style="background-color: blue;" />
				</div>
			</template>
		</v-checkbox>

		<v-checkbox
			v-model="selected"
			value="User2"
			@change="changed"
		>
			<template v-slot:label>
				<div class="input-color">
					Richard Doe <span class="dot" style="background-color: #880088;" />
				</div>
			</template>
		</v-checkbox>

		<v-checkbox
			v-model="selected"
			value="User3"
			@change="changed"
		>
			<template v-slot:label>
				<div class="input-color">
					Jane Doe <span class="dot" style="background-color: red;" />
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
		}
	}
};
</script>

<style>
.dot {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
}
</style>
