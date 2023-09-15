# prisma-extension-selecting

A Prisma client extension for setting `select` and `include` permanently for a model.

## Installation

```sh
npm install prisma-extension-selecting
```

## Usage

```ts
import { PrismaClient } from '@prisma/client'
import selecting from 'prisma-extension-selecting'

// apply the extension
const prisma = new PrismaClient().$extends(selecting)

// set "select" and/or "include" once and those values
// will be used for all applicable queries on `users`
const users = prisma.user.selecting({
  select: {
    id: true,
    name: true,
    posts: { select: { title: true } },
  },
})

// type UserWithPosts = { name: string; id: number; posts: { title: string; }[] }
type UserWithPosts = Prisma.UserGetPayload<typeof users.selection>

// all these queries will return only the fields selected above
users.create({ data: { ... } });
users.findMany();
users.findFirst({ where: { ... } });
users.findUniqueOrThrow({ where: { ... } });
users.update({ where: { ... }, data: { ... } });
users.delete({ where: { ... } });
```