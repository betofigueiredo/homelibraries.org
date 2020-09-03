function removeBook(_state, _action) {
	const state = _state || {};
	const action = _action || {};

	const all_ids = state.all_ids
		.filter(id => id !== action.book_id);

	return {
		...state,
		all_ids,
	};
}

export default removeBook;
