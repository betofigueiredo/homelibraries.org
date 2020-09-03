export const booksRequested = (_state) => {
	const state = _state || {};

	return {
		...state,
		fetching: 10,
	};
};
