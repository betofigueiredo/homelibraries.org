import update from 'immutability-helper';
import libraries from './store';
import { UPDATE_LIBRARIES, UPDATE_LIBRARIES_RAW } from './types';

const reducer = (state = libraries, action) => {
	switch (action.type) {
	case UPDATE_LIBRARIES: {
		switch (action.field.length) {
		case 1:
			return update(state, {
				[action.field[0]]: { $set: action.value },
			});
		case 2:
			return update(state, {
				[action.field[0]]: {
					[action.field[1]]: { $set: action.value },
				},
			});
		default:
			return state;
		}
	}

	case UPDATE_LIBRARIES_RAW: {
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
