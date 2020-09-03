function checkEmptyData({ action, by_id }) {
	if (
		action.book_id === undefined
		|| action.fields_n_values === undefined
		|| by_id[action.book_id] === undefined
	) {
		return true;
	}
	return false;
}

export const updateBook = (_state, _action) => {
	const state = _state || {};
	const action = _action || {};
	const by_id = state.by_id || {};

	const areEmptyData = checkEmptyData({ action, by_id });
	if (areEmptyData) {
		return state;
	}

	const book = {
		...by_id[action.book_id],
		...action.fields_n_values,
	};
	const _by_id = {
		...by_id,
		[action.book_id]: book,
	};

	return {
		...state,
		by_id: _by_id,
	};
};
