import { z } from "zod";

import { authenticatedProcedure, t } from "@server/trpc/utils";

export const userRouter = t.router({
  getSavedStocks: authenticatedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        id: { equals: ctx.session.user.id },
      },
    });

    return user?.stocks ?? [];
  }),
  updateSavedStocks: authenticatedProcedure
    .input(
      z.object({
        stocks: z.set(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          stocks: Array.from(input.stocks),
        },
      });
    }),
});
