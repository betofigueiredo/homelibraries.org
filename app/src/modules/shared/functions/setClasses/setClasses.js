export const setClasses = (first_class, additional_classes) => {
	if (
		typeof first_class !== 'string'
		|| typeof additional_classes === 'string'
		|| typeof additional_classes === 'number'
		|| additional_classes === null
		|| additional_classes === undefined
	) return ' ';

	const additional_classes_str = Object.keys(additional_classes)
		.map(c => c)
		.filter(c => additional_classes[c])
		.join(' ');

	return `${first_class} ${additional_classes_str}`;
};
