<template>
	<v-container>
		<v-select
			v-model="selected"
			:items="users"
			truc
			label="Users"
			multiple
			outlined
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
	watch: {
		selected: {
			handler(value) {
				this.$store.commit('setUsersSelection', value);
			},
			// Deep car on watch on tableau (objet avec profondeur) faire pareil si on watch un objet
			deep: true
		}
	},
	mounted() {
		this.selected = this.users;
	},
};
</script>
