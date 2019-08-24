import update from 'immutability-helper';
import mybooks from './store';

// Functions
import { buildMyBooks } from './utils';
import { logoffUser } from '../../functions/logoffUser';

const reducer = (state = mybooks, action) => {
	switch (action.type) {
	case 'UPDATE_MYBOOKS': {
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

	case 'UPDATE_MYBOOKS_RAW': {
		const all_fields = Object.keys(action.fields_n_values)
			.reduce((result, current) => ({
				...result,
				[current]: { $set: action.fields_n_values[current] },
			}), {});
		return update(state, all_fields);
	}

	case 'UPDATE_BOOK': {
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

	case 'MYBOOKS_REQUESTED': {
		return {
			...state,
			fetching: 10,
		};
	}

	case 'MYBOOKS_RECEIVED': {
		const books = action.payload.data || [];
		const books_byid_and_allids = buildMyBooks(books);
		return {
			...state,
			fetching: 20,
			by_id: books_byid_and_allids[0],
			all_ids: books_byid_and_allids[1],
		};
	}

	case 'MYBOOKS_REQUEST_FAILED': {
		const not_logged = action.status === 403;
		const fetching = not_logged ? 40 : 30;
		if (not_logged) logoffUser();
		return {
			...state,
			fetching,
		};
	}

	default:
		return state;
	}
};

export default reducer;
