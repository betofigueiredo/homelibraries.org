/* eslint-disable */
import { buildAllMessages, buildConversation } from './utils';

test('No messages', () => {
	expect(buildAllMessages())
		.toEqual([{}, []]);
	expect(buildAllMessages([]))
		.toEqual([{}, []]);
	expect(buildAllMessages('Backend error'))
		.toEqual([{}, []]);
	expect(buildAllMessages(null))
		.toEqual([{}, []]);
});

test('Build messages', () => {
	const messages = [
		{
			id: 1,
			id_book: 0,
			is_read: false,
			latest_update: '2019-08-04 00:00:00',
			message: 'Generate professional reports in just 3 seconds! Stop wasting time with manual tasks, increase your customer base, and improve the quality of your service',
			user: { uuid: '865a038fe1b610e6d72605', name: 'Guarujá 3', color: '#cccccc' },
		},
	];
	expect(buildAllMessages(messages))
		.toEqual([
			{
				1: {
					id: 1,
					id_book: 0,
					is_read: false,
					latest_update: '2019-08-04 00:00:00',
					message: 'Generate professional reports in just 3 seconds! Stop wasting time with manual tasks, increase your customer base, and improve the quality of your service',
					user: { uuid: '865a038fe1b610e6d72605', name: 'Guarujá 3', color: '#cccccc' },
				},
			},
			[1],
		]);
});

test('No conversation', () => {
	expect(buildConversation())
		.toEqual([{}, []]);
	expect(buildConversation([]))
		.toEqual([{}, []]);
	expect(buildConversation('Backend error'))
		.toEqual([{}, []]);
	expect(buildConversation(null))
		.toEqual([{}, []]);
});

test('Build conversation', () => {
	const conversation = [
		{
			book_confirmed: false,
			created: '2019-08-04 00:00:00',
			id: 1,
			id_book: 0,
			id_received: '2171031043843631',
			id_send: '865a038f6786f505',
			is_read: false,
			message: 'Generate professional reports in just 3',
			mine: false,
		},
	];
	expect(buildConversation(conversation))
		.toEqual([
			{
				1: {
					book_confirmed: false,
					created: '2019-08-04 00:00:00',
					id: 1,
					id_book: 0,
					id_received: '2171031043843631',
					id_send: '865a038f6786f505',
					is_read: false,
					message: 'Generate professional reports in just 3',
					mine: false,
				},
			},
			[1],
		]);
});
