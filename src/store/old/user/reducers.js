import update from 'immutability-helper';
import user from './store';
import { UPDATE_USER, UPDATE_USER_RAW, SET_AUTH, UNSET_AUTH } from './types';

const reducer = (state = user, action) => {
	switch (action.type) {
	case UPDATE_USER: {
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

	case UPDATE_USER_RAW: {
		const all_fields = Object.keys(action.fields_n_values)
			.reduce((result, current) => ({
				...result,
				[current]: { $set: action.fields_n_values[current] },
			}), {});
		return update(state, all_fields);
	}

	case UNSET_AUTH:
		localStorage.setItem('user', JSON.stringify({ email: '' }));
		return update(state, {
			logged: { $set: false },
			token: { $set: '' },
			email: { $set: '' },
			id: { $set: 0 },
			username: { $set: '' },
			name: { $set: '' },
		});

	case SET_AUTH:
		return update(state, {
			logged: { $set: true },
			token: { $set: action.token },
			email: { $set: action.user.email },
			id: { $set: Number(action.user.id) },
			nome: { $set: action.user.nome },
			tem_express: { $set: action.tem_express },
		});

	default:
		return state;
	}
};

export default reducer;
