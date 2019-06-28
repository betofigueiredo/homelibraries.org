export const toNumber = value => {
	const only_numbers = value.toString().replace(/\D/g, '');
	if (only_numbers === '') return 0;
	return Number(only_numbers);
};
