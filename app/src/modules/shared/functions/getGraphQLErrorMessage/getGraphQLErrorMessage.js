export const getGraphQLErrorMessage = (error) => {
	const error_message = (((error || {}).graphQLErrors || [])[0] || {}).message || '';
	return error_message;
};
