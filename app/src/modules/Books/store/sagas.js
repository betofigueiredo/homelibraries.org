import { takeLatest, put } from 'redux-saga/effects';
import {
	BOOKS_REQUESTED,
	BOOKS_RECEIVED,
	BOOKS_REQUEST_FAILED,
} from './types';

// Services
import { getQuery } from '../../../services/getQuery';

export function* fetchMyBooks() {
	try {
		const payload = yield getQuery();
		yield put({ type: BOOKS_RECEIVED, payload });
	} catch (error) {
		yield put({ type: BOOKS_REQUEST_FAILED, error });
	}
}

// saga
export default function* myBooksSaga() {
	yield takeLatest([BOOKS_REQUESTED], fetchMyBooks);
}
