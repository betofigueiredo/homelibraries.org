import {
	LOGIN_REQUESTED,
} from './types';

export const tryLogin = (email, password) => ({ type: LOGIN_REQUESTED, email, password });
