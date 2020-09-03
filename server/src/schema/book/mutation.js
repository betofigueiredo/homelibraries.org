export const mutation = {
	createBook(title: String!, author: String!, libraryId: ID!): Book
}

export const resolver = {
	createBook(root, args, context) {
		return context.prisma.createBook({
			title: args.title,
			author: args.author,
			owner: {
				connect: { id: args.libraryId },
			},
		})
	},
}
