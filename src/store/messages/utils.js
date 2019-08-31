export const buildAllMessages = (data) => {
	const all_messages = Array.isArray(data)
		? data || []
		: [];
	const all_ids_unsorted = [];
	const by_id = all_messages.reduce((result, current) => {
		all_ids_unsorted.push({ id: current.id, latest_update: current.latest_update });
		return { ...result, [current.id]: { ...current } };
	}, {});
	const all_ids = [...all_ids_unsorted]
		.sort((a, b) => new Date(b.latest_update) - new Date(a.latest_update))
		.map(c => c.id)
		.filter((el, i, a) => i === a.indexOf(el));
	return [by_id, all_ids];
};

export const buildConversation = (data) => {
	const conversation = Array.isArray(data)
		? data || []
		: [];
	const all_ids_unsorted = [];
	const by_id = conversation.reduce((result, current) => {
		all_ids_unsorted.push({ id: current.id, created: current.created });
		return { ...result, [current.id]: { ...current } };
	}, {});
	const all_ids = [...all_ids_unsorted]
		.sort((a, b) => new Date(b.created) - new Date(a.created))
		.map(c => c.id)
		.filter((el, i, a) => i === a.indexOf(el));
	return [by_id, all_ids];
};
