
export const query = {
	books: [Book!]!
	booksByLibrary(libraryId: ID!): [Book!]!
}

export const resolver = {
	books(root, args, context) {
		return context.prisma.books()
	},
	booksByLibrary(root, args, context) {
		return context.prisma.library({ id: args.libraryId }).books()
	},
}
