import { takeLatest, call, put } from 'redux-saga/effects';

// Services
import { instance } from '../../services/instance';

export function* fetchLibraries({ params }) {
	try {
		const payload = yield call(instance.get, '/libraries/all', { params });
		yield put({ type: 'LIBRARIES_RECEIVED', payload });
	} catch (error) {
		yield put({ type: 'LIBRARIES_REQUEST_FAILED', error });
	}
}

// saga
export default function* librariesSaga() {
	yield takeLatest(['LIBRARIES_REQUESTED'], fetchLibraries);
}
