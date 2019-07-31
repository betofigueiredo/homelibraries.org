/* eslint-disable */
import { buildMessages } from './utils';

test('No messages', () => {
	expect(buildMessages())
		.toEqual([{}, []]);
	expect(buildMessages([]))
		.toEqual([{}, []]);
	expect(buildMessages('Backend error'))
		.toEqual([{}, []]);
	expect(buildMessages(null))
		.toEqual([{}, []]);
});

test('Build messages', () => {
	const messages = [
		{ id: 1, name: 'Test 1' },
		{ id: 1, name: 'Test 1' },
		{ id: 2, name: 'Test 2' },
	];
	expect(buildMessages(messages))
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
