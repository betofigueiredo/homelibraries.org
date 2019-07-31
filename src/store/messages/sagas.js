import axios from 'axios';
import axiosRetry from 'axios-retry';
import { takeLatest, call, put } from 'redux-saga/effects';
import { MESSAGES_REQUESTED, MESSAGES_RECEIVED, MESSAGES_REQUEST_FAILED } from './types';

// Functions
import { getLocalstorageData } from '../../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

function fetchMessages(url, params = {}) {
	const baseURL = getLocalstorageData('environment', 'base_url');
	const token = getLocalstorageData('user', 'token');
	return axios({
		method: 'get',
		baseURL,
		url,
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

export function* fetchData(action) {
	try {
		const payload = yield call(() => fetchMessages(action.url, action.params));
		yield put({ type: MESSAGES_RECEIVED, payload });
	} catch (error) {
		yield put({ type: MESSAGES_REQUEST_FAILED, error });
	}
}

// saga
export default function* messagesSaga() {
	yield takeLatest([MESSAGES_REQUESTED], fetchData);
}
