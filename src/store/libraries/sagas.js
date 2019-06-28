import axios from 'axios';
import axiosRetry from 'axios-retry';
import { takeLatest, call, put } from 'redux-saga/effects';
import {
	LIBRARIES_REQUESTED,
	LIBRARIES_RECEIVED,
	LIBRARIES_REQUEST_FAILED,
} from './types';

// Functions
import { getLocalstorageData } from '../../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

function fetchLibraries(params = {}) {
	const baseURL = getLocalstorageData('environment', 'base_url');
	const token = getLocalstorageData('user', 'token');
	return axios({
		method: 'get',
		baseURL,
		url: '/libraries/all',
		headers: {
			common: {
				...axios.defaults.headers.common,
				token,
			},
			'content-type': 'application/json',
		},
		timeout: 120000,
		params,
		// validateStatus: status => (status >= 200 && status < 300) || status === 404,
	});
}

export function* watchLibraries(action) {
	try {
		const payload = yield call(() => fetchLibraries(action.params));
		yield put({ type: LIBRARIES_RECEIVED, payload });
	} catch (error) {
		yield put({ type: LIBRARIES_REQUEST_FAILED, error });
	}
}

// saga
export default function* librariesSaga() {
	yield takeLatest([LIBRARIES_REQUESTED], watchLibraries);
}
