
import { gql } from '@apollo/client';
import client from './client';

export function getQuery() {
	return client.query({
		query: gql`
			{
				booksByUser(userId: "ck58eyho600170782elkjp4c0") {
					id
					title
					author
					link
					available
				}

			}
		`,
	});
}
