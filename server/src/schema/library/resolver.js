const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    publishedPosts(root, args, context) {
      return context.prisma.posts({ where: { published: true } })
    },
    post(root, args, context) {
      return context.prisma.post({ id: args.postId })
    },
    postsByUser(root, args, context) {
      return context.prisma.user({ id: args.userId }).posts()
    },
    books(root, args, context) {
      return context.prisma.books()
    },
    booksByLibrary(root, args, context) {
      return context.prisma.library({ id: args.libraryId }).books()
    },
    users(root, args, context) {
      return context.prisma.users()
    },
    libraries(root, args, context) {
      return context.prisma.libraries()
    },
  },
  Mutation: {
    createDraft(root, args, context) {
      return context.prisma.createPost({
        title: args.title,
        author: {
          connect: { id: args.userId },
        },
      })
    },
    publish(root, args, context) {
      return context.prisma.updatePost({
        where: { id: args.postId },
        data: { published: true },
      })
    },
    createUser(root, args, context) {
      return context.prisma.createUser({ name: args.name })
    },
    createLibrary(root, args, context) {
      return context.prisma.createLibrary({ name: args.name })
    },
    createBook(root, args, context) {
      return context.prisma.createBook({
        title: args.title,
        author: args.author,
        owner: {
          connect: { id: args.libraryId },
        },
      })
    },
  },
  User: {
    posts(root, args, context) {
      return context.prisma.user({ id: root.id }).posts()
    },
  },
  Post: {
    author(root, args, context) {
      return context.prisma.post({ id: root.id }).author()
    },
  },
  // Book: {
  //   owner(root, args, context) {
  //     return context.prisma.book({ id: root.id }).owner()
  //   },
  // },
  Library: {
    books(root, args, context) {
      return context.prisma.library({ id: root.id }).books()
    },
  },
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma,
  },
})
server.start(() => console.log('Server is running on http://localhost:4000'))
