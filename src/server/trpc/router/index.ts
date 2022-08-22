import { stockRouter } from "@server/trpc/router/stocks";
import { t } from "@server/trpc/utils";
import { userRouter } from "@server/trpc/router/user";

export const appRouter = t.router({
  stocks: stockRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
