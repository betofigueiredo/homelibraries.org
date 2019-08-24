import axios from 'axios';
import axiosRetry from 'axios-retry';
import { takeLatest, call, put } from 'redux-saga/effects';
import { FETCH_REQUESTED, FETCH_SUCCEEDED, FETCH_FAILED } from './types';

// Functions
import { getLocalstorageData } from '../../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

function fetchBooks(url, params = {}) {
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
		const payload = yield call(() => fetchBooks(action.url, action.params));
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
