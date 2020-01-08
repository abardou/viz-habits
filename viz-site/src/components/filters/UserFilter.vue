<template>
	<v-container>
		<v-select
			v-model="selected"
			:items="users"
			truc
			label="Users"
			multiple
			outlined
			@change="changed"
		/>
	</v-container>
</template>

<script>
export default {
	name: 'UserFilter',
	props: {
		users: {
			default: null,
			type: Array
		}
	},
	data: () => ({
		selected: null
	}),
	mounted() {
		this.selected = this.users;
	},
	methods: {
		changed(value) {
			const toDel = [];
			const keep = []; 

			value.map( x => {
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
