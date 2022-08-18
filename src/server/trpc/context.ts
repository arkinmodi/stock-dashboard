import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

import { prisma } from "@server/db/client";

export const createContext = (opts: trpcNext.CreateNextContextOptions) => {
  const req = opts.req;
  const res = opts.res;
  return {
    req,
    res,
    prisma,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
