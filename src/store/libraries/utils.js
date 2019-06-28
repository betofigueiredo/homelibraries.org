export const buildLibraries = (data) => {
	const libraries = Array.isArray(data)
		? data || []
		: [];
	const all_ids_unsorted = [];
	const by_id = libraries.reduce((result, current) => {
		all_ids_unsorted.push(current.id);
		return {
			...result,
			[current.id]: {
				...current,
				icon: '/images/marker-blue.png',
			} };
	}, {});
	const all_ids = all_ids_unsorted
		.filter((el, i, a) => i === a.indexOf(el));
	return [by_id, all_ids];
};
