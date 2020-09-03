import { getGraphQLErrorMessage } from './getGraphQLErrorMessage';

test('GraphQL Error Message blank/null/undefined', () => {
	const result_blank = getGraphQLErrorMessage();
	expect(result_blank).toBe('');
	const result_null = getGraphQLErrorMessage(null);
	expect(result_null).toBe('');
});