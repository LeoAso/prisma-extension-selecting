import { Prisma, PrismaClient } from "@prisma/client"
import selecting from "."

const p = new PrismaClient().$extends(selecting)

const users = p.user.selecting({
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        title: true,
        _count: { select: { likes: true } },
      },
    },
  },
  orderBy: { name: "asc" },
})

const id = expect.any(Number)

let user: Prisma.UserGetPayload<typeof users.selection>

beforeAll(async () => {
  await p.$connect()
  await p.user.deleteMany()
})

afterAll(async () => {
  await p.$disconnect()
})

test("create", async () => {
  user = await users.create({
    data: {
      name: "Splinter",
      tag: "sensei",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post.",
          likes: {
            create: [
              { user: { create: { name: "Michaelangelo", tag: "mikey" } } },
              { user: { create: { name: "Donatello", tag: "donnie" } } },
              { user: { create: { name: "Raphael", tag: "raph" } } },
              { user: { create: { name: "Leonardo", tag: "leo" } } },
            ],
          },
        },
      },
    },
  })
  expect(user).toEqual({
    id,
    name: "Splinter",
    posts: [{ title: "Hello World", _count: { likes: 4 } }],
  })
})

test("findUnique", async () => {
  const found = await users.findUnique({ where: { id: user.id } })
  expect(found).toEqual({
    id: user.id,
    name: "Splinter",
    posts: [{ title: "Hello World", _count: { likes: 4 } }],
  })
})

test("findUnique (not found)", async () => {
  const found = await users.findUnique({ where: { tag: "april" } })
  expect(found).toEqual(null)
})

test("findFirst", async () => {
  const found = await users.findFirst({ where: { tag: "donnie" } })
  expect(found).toEqual({ id, name: "Donatello", posts: [] })
})

test("findFirst (not found)", async () => {
  const found = await users.findFirst({ where: { tag: "april" } })
  expect(found).toEqual(null)
})

test("findFirstOrThrow", async () => {
  const found = await users.findFirstOrThrow({
    where: { tag: "donnie" },
  })
  expect(found).toEqual({ id, name: "Donatello", posts: [] })
})

test("findFirstOrThrow (not found)", async () => {
  const find = users.findFirstOrThrow({ where: { tag: "april" } })
  await expect(find).rejects.toThrow()
})

test("findMany (all)", async () => {
  const found = await users.findMany()
  expect(found).toEqual([
    { id, name: "Donatello", posts: [] },
    { id, name: "Leonardo", posts: [] },
    { id, name: "Michaelangelo", posts: [] },
    { id, name: "Raphael", posts: [] },
    {
      id,
      name: "Splinter",
      posts: [{ title: "Hello World", _count: { likes: 4 } }],
    },
  ])
})

test("findMany (filter)", async () => {
  const found = await users.findMany({
    where: { name: { endsWith: "o" } },
    orderBy: { name: "asc" },
  })
  expect(found).toEqual([
    { id, name: "Donatello", posts: [] },
    { id, name: "Leonardo", posts: [] },
    { id, name: "Michaelangelo", posts: [] },
  ])
})

test("findMany (not found)", async () => {
  const found = await users.findMany({
    where: { posts: { some: { title: "I love the foot clan!" } } },
  })
  expect(found).toEqual([])
})

test("update", async () => {
  const updated = await users.update({
    where: { id: user.id },
    data: { name: "Master Splinter" },
  })
  expect(updated).toEqual({
    id: user.id,
    name: "Master Splinter",
    posts: [{ title: "Hello World", _count: { likes: 4 } }],
  })
})

test("upsert", async () => {
  const upserted = await users.upsert({
    where: { tag: "donnie" },
    create: { name: "Donatello", tag: "donnie" },
    update: { name: "Donatello", tag: "donny" },
  })
  expect(upserted).toEqual({
    id,
    name: "Donatello",
    posts: [],
  })
})

test("count", async () => {
  const count = await users.count()
  expect(count).toEqual(5)
})

test("delete", async () => {
  const deleted = await users.delete({ where: { id: user.id } })
  expect(deleted).toEqual({
    id: user.id,
    name: "Master Splinter",
    posts: [{ title: "Hello World", _count: { likes: 4 } }],
  })
})
