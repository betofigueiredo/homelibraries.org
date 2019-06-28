export const handleUpdateState = (e, value) => {
	if (e.target === undefined) {
		switch (value) {
		case 'true': return true;
		case 'false': return false;
		default: return value;
		}
	}
	return e.target.value;
};
