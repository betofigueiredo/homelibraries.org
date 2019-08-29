import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getLocalstorageData } from '../functions/_getLocalstorageData';

axiosRetry(axios, { retries: 3 });

const baseURL = getLocalstorageData('environment', 'base_url');
const token = getLocalstorageData('user', 'token');

export const instance = axios.create({
	baseURL,
	headers: {
		common: {
			...axios.defaults.headers.common,
			token,
		},
		'content-type': 'application/json',
	},
});
