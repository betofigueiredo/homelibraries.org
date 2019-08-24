import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalstorageData } from '../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

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
