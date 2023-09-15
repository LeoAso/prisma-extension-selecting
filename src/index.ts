import { Prisma as P } from "@prisma/client"

const hasSelect = [
  "findMany",
  "findFirst",
  "findUnique",
  "findFirstOrThrow",
  "findUniqueOrThrow",
  "create",
  "update",
  "upsert",
  "delete",
] as const

type HasSelect = (typeof hasSelect)[number]
type SI = "select" | "include"
type Selection<M> = Pick<P.Args<M, "findMany">, SI>
type Args<M, K extends HasSelect> = Omit<P.Args<M, K>, SI>
type Result<M, S, K extends HasSelect> = P.PrismaPromise<P.Result<M, S, K>>

export type Selecting<M, S> = { selection: S } & {
  [K in keyof M]: K extends HasSelect
    ? M[K] extends () => any
      ? (args?: Args<M, K>) => Result<M, S, K>
      : (args: Args<M, K>) => Result<M, S, K>
    : M[K]
}

/** Takes a Prisma model and returns a version with predefined values of `select` and `include`. */
export function modelSelecting<T, S>(model: T, selection: S): Selecting<T, S> {
  const f: any = { selection }
  for (const k of hasSelect) {
    f[k] = (a: any) => (model as any)[k]({ ...a, ...selection })
  }
  return new Proxy(model as any, {
    get(m, k, r) {
      return k in f ? f[k] : Reflect.get(m, k, r)
    },
  })
}

/** Prisma extension that adds a `selecting` function to each model for predefining `select` and `include`. */
export const selecting = P.defineExtension({
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
