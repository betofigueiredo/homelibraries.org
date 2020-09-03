const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

// external
const { userQuery, userMutation, User } = require('./user')
const { bookQuery, bookMutation, Book } = require('./book')

const resolvers = {
	Query: {
		...userQuery,
		...bookQuery,
	},
	Mutation: {
		...userMutation,
		...bookMutation,
	},
	User: { ...User },
	Book: { ...Book },
}

const server = new GraphQLServer({
	typeDefs: './schema.graphql',
	resolvers,
	// context: { prisma },
	context: request => ({
		...request,
		prisma,
	}),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
