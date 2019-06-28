import update from 'immutability-helper';
import search from './store';
import { UPDATE_SEARCH_RAW } from './types';

const reducer = (state = search, action) => {
	switch (action.type) {
	case UPDATE_SEARCH_RAW: {
		const all_fields = Object.keys(action.fields_n_values)
			.reduce((result, current) => ({
				...result,
				[current]: { $set: action.fields_n_values[current] },
			}), {});
		return update(state, all_fields);
	}

	default:
		return state;
	}
};

export default reducer;
