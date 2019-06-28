/* eslint-disable */
import { buildLibraries } from './utils';

test('No libraries', () => {
	expect(buildLibraries())
		.toEqual([{}, []]);
	expect(buildLibraries([]))
		.toEqual([{}, []]);
	expect(buildLibraries('Backend error'))
		.toEqual([{}, []]);
	expect(buildLibraries(null))
		.toEqual([{}, []]);
});

test('Build books', () => {
	const libraries = [
		{ id: 1, name: 'Test 1' },
		{ id: 1, name: 'Test 1' },
		{ id: 2, name: 'Test 2' },
	];
	expect(buildLibraries(libraries))
		.toEqual([
			{
				1: {
					id: 1,
					name: 'Test 1',
					icon: '/images/marker-blue.png',
				},
				2: {
					id: 2,
					name: 'Test 2',
					icon: '/images/marker-blue.png',
				},
			},
			[1, 2],
		]);
});
