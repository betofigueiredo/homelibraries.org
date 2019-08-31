import update from 'immutability-helper';
import messages from './store';

// Functions
import { buildAllMessages, buildConversation } from './utils';

const reducer = (state = messages, action) => {
	switch (action.type) {
	case 'UPDATE_MESSAGES': {
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

	case 'UPDATE_MESSAGES_RAW': {
		const all_fields = Object.keys(action.fields_n_values)
			.reduce((result, current) => ({
				...result,
				[current]: { $set: action.fields_n_values[current] },
			}), {});
		return update(state, all_fields);
	}

	case 'MESSAGES_REQUESTED': {
		return {
			...state,
			fetching: {
				...state.fetching,
				all_messages: 10,
			},
		};
	}

	case 'MESSAGES_RECEIVED': {
		const data = action.payload.data || [];
		const byid_and_allids = buildAllMessages(data);
		return {
			...state,
			fetching: {
				...state.fetching,
				all_messages: 20,
			},
			all_messages: {
				by_id: byid_and_allids[0],
				all_ids: byid_and_allids[1],
			},
		};
	}

	case 'MESSAGES_REQUEST_FAILED': {
		return {
			...state,
			fetching: {
				...state.fetching,
				all_messages: 30,
			},
		};
	}

	case 'CONVERSATION_REQUESTED': {
		return {
			...state,
			fetching: {
				...state.fetching,
				conversation: 10,
			},
		};
	}

	case 'CONVERSATION_RECEIVED': {
		const data = action.payload.data || {};
		const color = data.color || '';
		const name = data.name || '';
		const url = data.url || '';
		const uuid = data.uuid || '';
		const conversation = data.messages || [];
		const byid_and_allids = buildConversation(conversation);

		return {
			...state,
			fetching: {
				...state.fetching,
				conversation: 20,
			},
			conversation: {
				color,
				name,
				url,
				uuid,
				by_id: byid_and_allids[0],
				all_ids: byid_and_allids[1],
			},
		};
	}

	case 'CONVERSATION_REQUEST_FAILED': {
		return {
			...state,
			fetching: {
				...state.fetching,
				conversation: 30,
			},
		};
	}

	default:
		return state;
	}
};

export default reducer;
