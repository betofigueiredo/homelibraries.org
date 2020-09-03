import { takeLatest, put } from 'redux-saga/effects';
import {
	LOGIN_REQUESTED,
	LOGIN_RECEIVED,
	LOGIN_REQUEST_FAILED,
} from './types';

// Services
import { mutation } from '../../../services/mutation';

export function* login({ email, password }) {
	try {
		const payload = yield mutation(email, password);
		yield put({ type: LOGIN_RECEIVED, payload });
	} catch (error) {
		yield put({ type: LOGIN_REQUEST_FAILED, error });
	}
}

// saga
export default function* userSaga() {
	yield takeLatest([LOGIN_REQUESTED], login);
}
