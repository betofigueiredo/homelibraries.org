import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: new HttpLink({
		uri: 'http://localhost:4000',
	}),
	fetchPolicy: 'no-cache',
});

export default client;
