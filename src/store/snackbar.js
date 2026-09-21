export default {
	namespaced: true,
	state: {
		message: "",
		show: false,
		type: null
	},
	mutations: {
		showSnackbar(state, message) {
			state.message = message
			state.show = true
			state.type = 'success'
			setTimeout(() => {
				state.show = false;
			}, 3500)
		}
	},
	actions: {}
}
