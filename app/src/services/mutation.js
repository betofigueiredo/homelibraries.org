
import { gql } from '@apollo/client';
import client from './client';

export function mutation(email, password) {
	return client.mutate({
		mutation: gql`
			mutation ($email: String!, $password: String!) {
				login(
					email: $email
					password: $password
				) {
					token
					user {
						id
						email
						name
						username
						lat
						lng
						lfl
						language
					}
				}
			}
		`,
		variables: {
			email,
			password,
		},
	});
}
