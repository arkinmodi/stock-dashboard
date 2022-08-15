import { stockRouter } from "@server/trpc/router/stocks";
import { t } from "@server/trpc/utils";

export const appRouter = t.router({
  stocks: stockRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
