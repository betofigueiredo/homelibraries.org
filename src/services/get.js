import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalstorageData } from '../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

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
