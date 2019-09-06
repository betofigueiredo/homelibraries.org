import { takeLatest, call, put } from 'redux-saga/effects';

// Services
import { instance } from '../../services/instance';

export function* fetchAllMessages() {
	try {
		const payload = yield call(instance.get, '/messages/all');
		yield put({ type: 'MESSAGES_RECEIVED', payload });
	} catch (error) {
		yield put({ type: 'MESSAGES_REQUEST_FAILED', error });
	}
}

export function* fetchConversation({ uuid = '' }) {
	try {
		const payload = yield call(instance.get, `/messages/view/${uuid}`);
		yield put({ type: 'CONVERSATION_RECEIVED', payload });
	} catch (error) {
		yield put({ type: 'CONVERSATION_REQUEST_FAILED', error });
	}
}

export function* sendNewMessage({ uuid = '', message = '' }) {
	if (uuid === '' || message === '') return;
	const params = { message };
	try {
		const payload = yield call(instance.post, `/messages/${uuid}/add`, params);
		yield put({ type: 'SEND_NEW_MESSAGE_SUCCESS', payload });
	} catch (error) {
		yield put({ type: 'SEND_NEW_MESSAGE_FAILED', error });
	}
}

// saga
export default function* messagesSaga() {
	yield takeLatest(['MESSAGES_REQUESTED'], fetchAllMessages);
	yield takeLatest(['CONVERSATION_REQUESTED'], fetchConversation);
	yield takeLatest(['SEND_NEW_MESSAGE_REQUESTED'], sendNewMessage);
}
