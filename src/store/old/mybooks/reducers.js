import update from 'immutability-helper';
import mybooks from './store';
import { UPDATE_MYBOOKS, UPDATE_MYBOOKS_RAW, UPDATE_BOOK } from './types';

const reducer = (state = mybooks, action) => {
	switch (action.type) {
	case UPDATE_MYBOOKS: {
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

	case UPDATE_MYBOOKS_RAW: {
		const all_fields = Object.keys(action.fields_n_values)
			.reduce((result, current) => ({
				...result,
				[current]: { $set: action.fields_n_values[current] },
			}), {});
		return update(state, all_fields);
	}

	case UPDATE_BOOK: {
		const book = {
			...state.by_id[action.book_id],
			...action.fields_n_values,
		};
		const by_id = {
			...state.by_id,
			[action.book_id]: book,
		};
		return update(state, { by_id: { $set: by_id } });
	}

	default:
		return state;
	}
};

export default reducer;
