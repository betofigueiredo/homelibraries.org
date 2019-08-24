import { takeLatest, call, put } from 'redux-saga/effects';

// Services
import { _get } from '../../services/get';

export function* fetchData() {
	try {
		const payload = yield call(() => _get('/books/mybooks', {}));
		yield put({ type: 'MYBOOKS_RECEIVED', payload });
	} catch (error) {
		const { status } = (error || {}).response || {};
		yield put({ type: 'MYBOOKS_REQUEST_FAILED', status });
	}
}

// saga
export default function* myBooksSaga() {
	yield takeLatest(['MYBOOKS_REQUESTED'], fetchData);
}
