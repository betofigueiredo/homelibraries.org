export const typeDef = `
	type Book {
		id: ID!
		owner: Library
		title: String!
		author: String!
		link: String
		available: Boolean!
	}
`;

export const resolvers = {
  Query: {
    book: () => { ... },
  },
  Book: {
    author: () => { ... },
  }
};
