
export const data = {
	id: ID! @id
	owner: Library @relation(link: INLINE)
	title: String!
	author: String!
	link: String @default(value: "")
	available: Boolean! @default(value: true)
}
