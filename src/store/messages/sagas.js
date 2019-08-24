import { takeLatest, call, put } from 'redux-saga/effects';

// Services
import { _get } from '../../services/get';

export function* fetchMessages(action) {
	try {
		const payload = yield call(() => _get(action.url, action.params));
		yield put({ type: 'MESSAGES_RECEIVED', payload });
	} catch (error) {
		yield put({ type: 'MESSAGES_REQUEST_FAILED', error });
	}
}

// saga
export default function* messagesSaga() {
	yield takeLatest(['MESSAGES_REQUESTED'], fetchMessages);
}
