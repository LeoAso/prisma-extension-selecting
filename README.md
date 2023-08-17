# prisma-extension-selecting

A Prisma client extension for setting `select` and `include` permanently for a model.

## Installation

Pick the installation command for your package manager.

```sh
npm install prisma-extension-selecting
```

## Usage

```ts
import { PrismaClient } from '@prisma/client'
import selecting from 'prisma-extension-selecting'

// apply the extension
const prisma = new PrismaClient().$extends(selecting)

// set a selection for a model; for example, 
// this user model will only ID, name and post titles 
// from find, create, update and delete operations
const users = prisma.user.selecting({
  select: {
    id: true,
    name: true,
    posts: { select: { title: true } },
  },
})

// type UserWithPosts = { name: string; id: number; posts: { title: string; }[] }
type UserWithPosts = Prisma.UserGetPayload<typeof users.selection>

// all these queries will return items with only the fields specified above

users.create({
  data: {
    name: "John Doe",
    username: "john.doe",
    bio: "Lorem ipsum",
    password: "c0rrect horse battery staple",
    email: "john.doe@example.com",
    website: "https://example.com/johndoe",
    posts: {
      create: {
        title: "Hello World",
        content: "This is my first post.",
      },
    },
  },
});

users.findMany({});

users.findUniqueOrThrow({
  where: { name: { contains: "John" } },
});

users.update({
  where: { username: "john.doe" },
  data: { bio: "Foo Bar" },
});
```