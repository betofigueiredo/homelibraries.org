export const getLocalstorageData = (object, field) => {
	const localstorage_exists = localStorage.getItem(object);
	if (localstorage_exists !== undefined && localstorage_exists !== null) {
		const user_localstorage_values = JSON.parse(localstorage_exists);
		return user_localstorage_values[field] !== undefined ? user_localstorage_values[field] : '';
	}
	return '';
};

export const setLocalstorageData = (name, params) => {
	localStorage.setItem(name, JSON.stringify(params));
};

export const setValueLocalstorageUser = (field, value) => {
	const localstorage_exists = localStorage.getItem('user');
	if (localstorage_exists !== undefined && localstorage_exists !== null) {
		const user_localstorage_values = JSON.parse(localstorage_exists);
		const user_localstorage = {
			...user_localstorage_values,
			[field]: value,
		};
		localStorage.setItem('user', JSON.stringify(user_localstorage));
	}
};
