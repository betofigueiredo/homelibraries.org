import update from 'immutability-helper';
import mybooks from './store';
import {
	UPDATE_MYBOOKS,
	UPDATE_MYBOOKS_RAW,
	UPDATE_BOOK,
	FETCH_REQUESTED,
	FETCH_SUCCEEDED,
	FETCH_FAILED,
} from './types';

// Functions
import { buildMyBooks } from './utils';

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

	case FETCH_REQUESTED: {
		return {
			...state,
			fetching: 10,
		};
	}

	case FETCH_SUCCEEDED: {
		const books = action.payload.data || [];
		const books_byid_and_allids = buildMyBooks(books);
		return {
			...state,
			fetching: 20,
			by_id: books_byid_and_allids[0],
			all_ids: books_byid_and_allids[1],
		};
	}

	case FETCH_FAILED: {
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
