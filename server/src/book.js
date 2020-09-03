// export const typeDef = `
// 	type Book {
// 		id: ID!
// 		owner: User
// 		title: String!
// 		author: String!
// 		link: String
// 		available: Boolean
// 		createdAt: DateTime!
// 		updatedAt: DateTime!
// 	}
// `;

const bookQuery = {
	booksByUser(root, args, context, info) {
		return context.prisma
			.user({ id: args.userId })
			.books()
			.then(r => r || [])
	},
};

const bookMutation = {
	createBook(root, args, context) {
		return context.prisma.createBook({
			title: args.title,
			author: args.author,
			link: args.link,
			owner: {
				connect: { id: args.userId },
			},
		})
	},
	updateBook(root, args, context) {
		return context.prisma.updateBook({
			where: { id: args.bookId },
			data: {
				title: args.title,
				author: args.author,
				link: args.link,
				available: args.available,
			},
		})
	},
};

const Book = {
	owner(root, args, context) {
		return context.prisma.book({ id: root.id }).owner()
	},
};

module.exports.bookQuery = bookQuery;
module.exports.bookMutation = bookMutation;
module.exports.Book = Book;
