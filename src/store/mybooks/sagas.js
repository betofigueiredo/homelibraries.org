import { takeLatest, call, put } from 'redux-saga/effects';
import { FETCH_REQUESTED, FETCH_SUCCEEDED, FETCH_FAILED } from './types';

// Services
import { _get } from '../../services/get';

export function* fetchData() {
	try {
		const payload = yield call(() => _get('/books/mybooks', {}));
		yield put({ type: FETCH_SUCCEEDED, payload });
	} catch (error) {
		const { status } = (error || {}).response || {};
		yield put({ type: FETCH_FAILED, status });
	}
}

// saga
export default function* myBooksSaga() {
	yield takeLatest([FETCH_REQUESTED], fetchData);
}
