function loginRequested(_state) {
	const state = _state || {};

	return {
		...state,
		logging_in: 10,
	};
}

export default loginRequested;
