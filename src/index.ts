import { Prisma } from "@prisma/client"
import { Operation } from "@prisma/client/runtime/library"

type Selection<T> = Partial<
  Pick<Prisma.Args<T, "findMany">, "select" | "include">
>

type SFunction<T, S extends Selection<T>, O extends Operation> = (
  args: Omit<Prisma.Args<T, O>, "select" | "include">
) => Prisma.PrismaPromise<Prisma.Result<T, S, O>>

/** Applies predefined values of `select` and `include` to a Prisma model function. */
function sFunction<T, S extends Selection<T>, O extends Operation>(
  model: T,
  selection: S,
  operation: O
): SFunction<T, S, O> {
  return args => (model as any)[operation]({ ...args, ...selection })
}

function sFunctions<T, S extends Selection<T>>(model: T, s: S) {
  return {
    selection: s,
    findMany: sFunction(model, s, "findMany"),
    findFirst: sFunction(model, s, "findFirst"),
    findUnique: sFunction(model, s, "findUnique"),
    findFirstOrThrow: sFunction(model, s, "findFirstOrThrow"),
    findUniqueOrThrow: sFunction(model, s, "findUniqueOrThrow"),
    create: sFunction(model, s, "create"),
    update: sFunction(model, s, "update"),
    upsert: sFunction(model, s, "upsert"),
    delete: sFunction(model, s, "delete"),
  }
}

type SFunctions<T, S extends Selection<T>> = ReturnType<typeof sFunctions<T, S>>

export type ModelSelecting<T, S extends Selection<T>> = SFunctions<T, S> &
  Omit<T, keyof SFunctions<T, S>>

/** Takes a Prisma model and returns a version with predefined values of `select` and `include`. */
export function modelSelecting<T, S extends Selection<T>>(
  model: T,
  selection: S
): ModelSelecting<T, S> {
  const sf = sFunctions(model, selection) as any
  return new Proxy(model as any, {
    get(target, prop) {
      return sf[prop] || target[prop]
    },
  })
}

/** Prisma extension that adds a `selecting` function to each model for predefining `select` and `include`. */
export const selecting = Prisma.defineExtension({
  name: "selecting",
  model: {
    $allModels: {
      selecting<T, S extends Selection<T>>(this: T, s: S) {
        return modelSelecting(this, s)
      },
    },
  },
})

export default selecting
