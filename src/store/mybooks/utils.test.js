/* eslint-disable */
import { buildMyBooks } from './utils';

test('No books', () => {
	expect(buildMyBooks())
		.toEqual([{}, []]);
	expect(buildMyBooks([]))
		.toEqual([{}, []]);
	expect(buildMyBooks('Backend error'))
		.toEqual([{}, []]);
	expect(buildMyBooks(null))
		.toEqual([{}, []]);
});

test('Build books', () => {
	const books = [
		{ id: 1, name: 'Test 1' },
		{ id: 1, name: 'Test 1' },
		{ id: 2, name: 'Test 2' },
	];
	expect(buildMyBooks(books))
		.toEqual([
			{
				1: {
					id: 1,
					name: 'Test 1',
					edited: false,
					added: false,
				},
				2: {
					id: 2,
					name: 'Test 2',
					edited: false,
					added: false,
				},
			},
			[1, 2],
		]);
});
