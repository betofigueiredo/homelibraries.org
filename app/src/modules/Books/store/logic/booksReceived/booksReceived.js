function buildMyBooks(data) {
	const books = Array.isArray(data)
		? data || []
		: [];
	const all_ids_unsorted = [];
	const by_id = books.reduce((result, current) => {
		all_ids_unsorted.push({ id: current.id, title: current.title });
		const book = {
			...current,
			edited: false,
			added: false,
		};
		return { ...result, [current.id]: book };
	}, {});
	const all_ids = [...all_ids_unsorted]
		.sort((a, b) => {
			if (a.title < b.title) { return -1; }
			if (a.title > b.title) { return 1; }
			return 0;
		})
		.map(c => c.id)
		.filter((el, i, a) => i === a.indexOf(el));
	return [by_id, all_ids];
}

export const booksReceived = (_state, _action) => {
	const state = _state || {};
	const action = _action || {};

	const books = ((action.payload || {}).data || {}).booksByUser || [];

	const books_byid_and_allids = buildMyBooks(books);
	return {
		...state,
		fetching: 20,
		by_id: books_byid_and_allids[0],
		all_ids: books_byid_and_allids[1],
	};
};
