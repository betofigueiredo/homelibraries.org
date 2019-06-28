import update from 'immutability-helper';
import libraries from './store';
import {
	UPDATE_LIBRARIES,
	UPDATE_LIBRARIES_RAW,
	LIBRARIES_REQUESTED,
	LIBRARIES_RECEIVED,
	LIBRARIES_REQUEST_FAILED,
} from './types';

// Functions
import { buildLibraries } from './utils';

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

	case LIBRARIES_REQUESTED: {
		return {
			...state,
			fetching: 10,
			by_id: {},
			all_ids: [],
		};
	}

	case LIBRARIES_RECEIVED: {
		const all_libraries = action.payload.data || [];
		const byid_and_allids = buildLibraries(all_libraries);
		return {
			...state,
			fetching: 20,
			by_id: byid_and_allids[0],
			all_ids: byid_and_allids[1],
		};
	}

	case LIBRARIES_REQUEST_FAILED: {
		return {
			...state,
			fetching: 30,
		};
	}

	default:
		return state;
	}
};

export default reducer;
