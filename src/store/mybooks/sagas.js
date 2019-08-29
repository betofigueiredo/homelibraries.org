import { takeLatest, call, put } from 'redux-saga/effects';

// Services
import { instance } from '../../services/instance';

export function* fetchMyBooks() {
	try {
		const payload = yield call(instance.get, '/books/mybooks');
		yield put({ type: 'MYBOOKS_RECEIVED', payload });
	} catch (error) {
		const { status } = (error || {}).response || {};
		yield put({ type: 'MYBOOKS_REQUEST_FAILED', status });
	}
}

// saga
export default function* myBooksSaga() {
	yield takeLatest(['MYBOOKS_REQUESTED'], fetchMyBooks);
}
