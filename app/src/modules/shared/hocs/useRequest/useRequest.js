import { useState, useEffect } from 'react';

// Functions
import { _get } from '../../components/_functions/_requests';

function useRequest(url, params) {
	const [response, setResponse] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		function fetchData() {
			setIsLoading(true);

			_get(url, params).then(res => {
				const data = res.data || {};
				setResponse(data);
				setIsLoading(false);
			}).catch(err => {
				setError(err);
			});
		}

		fetchData();
	}, []);

	return { response, error, isLoading };
}

export default useRequest;
