import { takeLatest, call, put } from 'redux-saga/effects';

// Services
import { instance } from '../../services/instance';

export function* fetchMessages({ url = '' }) {
	try {
		const payload = yield call(instance.get, url);
		yield put({ type: 'MESSAGES_RECEIVED', payload });
	} catch (error) {
		yield put({ type: 'MESSAGES_REQUEST_FAILED', error });
	}
}

// saga
export default function* messagesSaga() {
	yield takeLatest(['MESSAGES_REQUESTED'], fetchMessages);
}
