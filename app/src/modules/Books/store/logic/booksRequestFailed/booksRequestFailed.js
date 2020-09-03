export const booksRequestFailed = (_state, _action) => {
	/* eslint-disable */

	const state = _state || {};
	const action = _action || {};

	// const not_logged = action.status === 403;
	// const fetching = not_logged ? 40 : 30;
	// if (not_logged) logoffUser();
	// return {
	// 	...state,
	// 	fetching,
	// };

	return { ...state };
};
