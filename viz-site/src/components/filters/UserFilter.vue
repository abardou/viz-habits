<template>
	<v-container>
		{{ label }}
		<v-checkbox
			v-model="selected"
			:label="'John Doe'"
			value="User1"
			default="checked"
			@change="changed"
		/>
		<v-checkbox
			v-model="selected"
			:label="'Richard Doe'"
			value="User2"
			@change="changed"
		/>
		<v-checkbox
			v-model="selected"
			:label="'Jane Doe'"
			value="User3"
			@change="changed"
		/>
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
