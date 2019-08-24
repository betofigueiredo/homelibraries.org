import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalstorageData } from '../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

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
