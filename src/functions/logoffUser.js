export const logoffUser = () => {
	localStorage.setItem('user', JSON.stringify({ email: '' }));
};
