import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalstorageData } from './_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

/* ------------------------------------------------------ *\
	get
\* ------------------------------------------------------ */
export function _get(url, data = {}) {
	const baseURL = getLocalstorageData('environment', 'base_url');
	const token = getLocalstorageData('user', 'token');
	const params = { ...data };
	return axios({
		method: 'get',
		url,
		baseURL,
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

/* ------------------------------------------------------ *\
	put
\* ------------------------------------------------------ */
export function _put(url, data) {
	const baseURL = getLocalstorageData('environment', 'base_url');
	const token = getLocalstorageData('user', 'token');
	return axios({
		method: 'put',
		url,
		baseURL,
		headers: {
			common: {
				...axios.defaults.headers.common,
				token,
			},
		},
		timeout: 120000,
		data,
	});
}

/* ------------------------------------------------------ *\
	post
\* ------------------------------------------------------ */
export function _post(url, params) {
	const baseURL = getLocalstorageData('environment', 'base_url');
	const token = getLocalstorageData('user', 'token');
	const data = new FormData();
	const keys = Object.keys(params);
	for (let i = 0; i < keys.length; i++) {
		const attr = keys[i];
		const value = params[keys[i]];
		data.append(attr, value);
	}
	const headers = token !== ''
		? {
			common: {
				...axios.defaults.headers.common,
				token,
			},
		}
		: { ...axios.defaults.headers };
	return axios({
		method: 'post',
		url,
		baseURL,
		headers,
		timeout: 120000,
		data,
	});
}

/* ------------------------------------------------------ *\
	delete
\* ------------------------------------------------------ */
export function _delete(url) {
	const baseURL = getLocalstorageData('environment', 'base_url');
	const token = getLocalstorageData('user', 'token');
	return axios({
		method: 'delete',
		url,
		baseURL,
		headers: {
			common: {
				...axios.defaults.headers.common,
				token,
			},
		},
		timeout: 120000,
	});
}
