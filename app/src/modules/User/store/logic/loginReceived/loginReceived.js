function setUserOnLocalstorage({ token, id, email, name }) {
	const user = {
		token,
		id,
		email,
		name,
	};
	localStorage.setItem('user', JSON.stringify(user));
}

function loginReceived(_state, _action) {
	const state = _state || {};
	const action = _action || {};
	const login_data = ((action.payload || {}).data || {}).login || {};
	const token = login_data.token || '';
	const user = login_data.user || {};
	const id = user.id || '';
	const email = user.email || '';
	const name = user.name || '';
	const username = user.username || '';
	const lat = user.lat || 0;
	const lng = user.lng || 0;
	const lfl = user.lfl || false;
	const language = user.language || 'pt-br';

	setUserOnLocalstorage({ token, id, email, name });

	return {
		...state,
		logging_in: 20,
		token,
		id,
		email,
		name,
		username,
		lat,
		lng,
		lfl,
		language,
	};
}

export default loginReceived;
