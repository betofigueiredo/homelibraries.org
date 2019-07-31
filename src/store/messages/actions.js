import {
	UPDATE_MESSAGES,
	UPDATE_MESSAGES_RAW,
	MESSAGES_REQUESTED,
} from './types';

export const updateMessages = (field, value) => ({ type: UPDATE_MESSAGES, field, value });
export const updateMessagesRaw = (fields_n_values) => ({ type: UPDATE_MESSAGES_RAW, fields_n_values });
export const getMessages = (url, params = {}) => ({ type: MESSAGES_REQUESTED, url, params });
