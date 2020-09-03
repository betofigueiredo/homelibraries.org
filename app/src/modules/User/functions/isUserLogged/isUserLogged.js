function checkJSON(json) {
	try {
		return JSON.parse(json);
	} catch (e) {
		return '';
	}
}

function getUserLocalstorageData(field) {
	const user_localstorage_values = checkJSON(localStorage.getItem('user')) || {};
	return user_localstorage_values[field] !== undefined
		? user_localstorage_values[field]
		: '';
}

export const isUserLogged = () => {
	const token = getUserLocalstorageData('token');
	const id = getUserLocalstorageData('id');
	const email = getUserLocalstorageData('email');

	if (token === '' || id === null || email === '') {
		return false;
	}

	return true;
};
