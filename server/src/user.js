const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('./utils')

const userQuery = {
	users(root, args, context) {
		return context.prisma.users()
	},
	// users2(root, args, context, info) {
	// 	const where = args.filter ? {
	// 		OR: [
	// 			{ name_contains: args.filter },
	// 			{ username_contains: args.filter },
	// 		],
	// 	} : {};
	// 	return context.prisma.users({ where });
	// }
	searchUsersOnMap(root, args, context, info) {
		return context.prisma.users({ where: {
			AND: [{
				lat_gte: 5
			}, {
				lat_lte: 20
			}]
		}});
	}
};

const userMutation = {
	createUser(root, args, context) {
		return context.prisma.createUser({
			email: args.email,
			password: args.password,
			name: args.name,
		})
	},
	// updateUser(root, args, context) {
	// 	const userId = getUserId(context);
	// 	const {
	// 		email,
	// 		password,
	// 		name,
	// 		username,
	// 		about,
	// 		address,
	// 		lat,
	// 		lng,
	// 		lfl,
	// 		language,
	// 	} = args;
	// 	return context.prisma.updateUser({
	// 		// where: { id: userId },
	// 		where: { connect: { id: userId } },
	// 		data: {
	// 			email,
	// 			password,
	// 			name,
	// 			username,
	// 			about,
	// 			address,
	// 			lat,
	// 			lng,
	// 			lfl,
	// 			language,
	// 		},
	// 	})
	// },
	async signup(root, args, context, info) {
		const password = await bcrypt.hash(args.password, 10);
		const user = await context.prisma.createUser({ ...args, password });
		const token = jwt.sign({ userId: user.id }, APP_SECRET);
		return { token, user };
	},
	async login(root, args, context, info) {
		const user = await context.prisma.user({ email: args.email });
		if (!user) {
			throw new Error('No such user found');
		}
		const valid = await bcrypt.compare(args.password, user.password)
		if (!valid) {
			throw new Error('Invalid password')
		}
		const token = jwt.sign({ userId: user.id }, APP_SECRET);
		return { token, user };
	},
};

const User = {
	books(root, args, context) {
		return context.prisma.user({ id: root.id }).books()
	},
};

module.exports.userQuery = userQuery;
module.exports.userMutation = userMutation;
module.exports.User = User;
